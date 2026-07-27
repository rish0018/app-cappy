package com.cappy.mobile

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.Image
import android.util.Log
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import java.io.ByteArrayOutputStream

/**
 * Vision-camera frame processor plugin ("handLandmarks") wrapping MediaPipe Tasks
 * Vision's HandLandmarker for real-time, on-device hand landmark extraction.
 *
 * Registered from MainApplication.onCreate() (must happen before any JS calls
 * VisionCameraProxy.initFrameProcessorPlugin("handLandmarks", ...)).
 *
 * Model: android/app/src/main/assets/hand_landmarker.task (MediaPipe's standard
 * 21-point hand skeleton, float16 variant, downloaded from
 * storage.googleapis.com/mediapipe-models/hand_landmarker).
 *
 * Output shape mirrors the iOS reference implementation
 * (lukaszkurantdev/blog-hand-landmarks): an array of hands, each an array of 21
 * {x, y, z} objects with x/y/z normalized 0-1 (MediaPipe's own normalization,
 * same convention @mediapipe/tasks-vision uses on web) — see
 * apps/mobile/src/ml/handLandmarks.ts for the JS-side flattening into the
 * 63-number HandLandmarks shape @cappy/core's HandPosePredictor expects.
 */
class HandLandmarksFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?) : FrameProcessorPlugin() {
  private val handLandmarker: HandLandmarker by lazy {
    val baseOptions = BaseOptions.builder().setModelAssetPath("hand_landmarker.task").build()
    val landmarkerOptions =
      HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.VIDEO)
        .setNumHands(1)
        .setMinHandDetectionConfidence(0.5f)
        .setMinHandPresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .build()
    HandLandmarker.createFromOptions(proxy.context, landmarkerOptions)
  }

  override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
    return try {
      // MediaPipe's MediaImageBuilder(android.media.Image) only accepts
      // RGBA_8888 — Camera2/CameraX ImageAnalysis frames are always
      // YUV_420_888 in practice regardless of vision-camera's JS-level
      // `pixelFormat` prop (that prop doesn't change the underlying Image's
      // native format). Confirmed via a real UnsupportedOperationException
      // on-device before this fix. So we convert YUV -> NV21 -> JPEG -> Bitmap
      // ourselves and use BitmapImageBuilder instead.
      val bitmap = yuv420ToBitmap(frame.image)
      val mpImage = BitmapImageBuilder(bitmap).build()
      val timestampMs = frame.timestamp / 1_000_000
      val result = handLandmarker.detectForVideo(mpImage, timestampMs)

      result.landmarks().map { hand ->
        hand.map { landmark ->
          // JSI marshaling only understands Double (not Float) for numeric
          // values — confirmed via a real "Cannot convert Java type class
          // java.lang.Float to jsi::Value" crash on-device before this fix.
          mapOf(
            "x" to landmark.x().toDouble(),
            "y" to landmark.y().toDouble(),
            "z" to landmark.z().toDouble(),
          )
        }
      }
    } catch (error: Throwable) {
      // Frame-invalid / detector-not-ready errors are expected transiently
      // (e.g. first few frames while the model loads) — surface as "no hand
      // detected" rather than crashing the frame processor worklet thread.
      Log.w("HandLandmarksPlugin", "detect failed: ${error.javaClass.simpleName}: ${error.message}")
      null
    }
  }

  /**
   * Converts a YUV_420_888 android.media.Image (3-plane, with possibly-padded
   * row/pixel strides) to a Bitmap via NV21 + YuvImage's built-in JPEG
   * encoder. Not the fastest path (a real production build would use
   * RenderScript/GPU or a native YUV->RGB routine), but correctness over
   * speed for verifying the detection pipeline actually works end-to-end.
   */
  private fun yuv420ToBitmap(image: Image): Bitmap {
    val width = image.width
    val height = image.height
    val nv21 = ByteArray(width * height * 3 / 2)

    // Y plane: copy row-by-row respecting rowStride (may include padding).
    val yPlane = image.planes[0]
    val yBuffer = yPlane.buffer
    val yRowStride = yPlane.rowStride
    var offset = 0
    val yRow = ByteArray(yRowStride)
    for (row in 0 until height) {
      yBuffer.position(row * yRowStride)
      yBuffer.get(yRow, 0, minOf(yRowStride, yBuffer.remaining()))
      System.arraycopy(yRow, 0, nv21, offset, width)
      offset += width
    }

    // U/V planes: NV21 wants interleaved VU per 2x2 block. Camera2's U/V
    // planes commonly share pixelStride=2 (already interleaved in memory,
    // just with U/V swapped vs. NV21's V-then-U order) or pixelStride=1
    // (planar, no interleaving) — handle both explicitly instead of assuming.
    val uPlane = image.planes[1]
    val vPlane = image.planes[2]
    val uBuffer = uPlane.buffer
    val vBuffer = vPlane.buffer
    val uRowStride = uPlane.rowStride
    val uPixelStride = uPlane.pixelStride
    val vRowStride = vPlane.rowStride
    val vPixelStride = vPlane.pixelStride
    val chromaHeight = height / 2
    val chromaWidth = width / 2

    for (row in 0 until chromaHeight) {
      for (col in 0 until chromaWidth) {
        val vIndex = row * vRowStride + col * vPixelStride
        val uIndex = row * uRowStride + col * uPixelStride
        nv21[offset++] = vBuffer.get(vIndex)
        nv21[offset++] = uBuffer.get(uIndex)
      }
    }

    val yuvImage = YuvImage(nv21, ImageFormat.NV21, width, height, null)
    val out = ByteArrayOutputStream()
    yuvImage.compressToJpeg(Rect(0, 0, width, height), 90, out)
    val jpegBytes = out.toByteArray()
    return BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.size)
  }

  companion object {
    init {
      FrameProcessorPluginRegistry.addFrameProcessorPlugin("handLandmarks") { proxy, options ->
        HandLandmarksFrameProcessorPlugin(proxy, options)
      }
    }

    /** Called once from MainApplication.onCreate() to force this class (and its registration) to load. */
    fun register() {
      // No-op body: referencing this object from Kotlin is enough to run the
      // `init` block above and register the plugin, since Kotlin `object`/
      // companion initializers run lazily on first access.
    }
  }
}
