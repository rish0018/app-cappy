# Git Survival Guide

A practical guide for day-to-day development.

## 1. Check your current branch

``` bash
git branch
git status
```
To make sure you push with PR into develop
- git push -u origin feature/<task-name>
Example:

``` text
* UI
  develop
  main
```

## 2. Create a new feature branch

``` bash
git switch develop
git pull origin develop
git switch -c feature/my-feature
```

## 3. Switch branches

``` bash
git switch UI
```

or

``` bash
git checkout UI
```

## 4. Save your work

``` bash
git add .
git commit -m "Describe the change"
```

## 5. Push a new branch

``` bash
git push -u origin UI
```

After the first push:

``` bash
git push
```

## 6. Update your feature branch with latest develop

``` bash
git switch develop
git pull origin develop

git switch UI
git merge develop
```

If Git says:

``` text
Already up to date.
```

there is nothing new to merge.

## 7. Merge conflicts

Check conflicting files:

``` bash
git status
```

Resolve the files, then:

``` bash
git add .
git commit
```

## 8. Stash work temporarily

``` bash
git stash
git switch develop
```

Restore later:

``` bash
git stash pop
```

List stashes:

``` bash
git stash list
```

## 9. Undo changes

Discard one file:

``` bash
git restore file.txt
```

Discard everything not committed:

``` bash
git restore .
```

⚠️ This deletes uncommitted changes.

## 10. Undo last commit

Keep the changes:

``` bash
git reset --soft HEAD~1
```

Discard the commit and changes:

``` bash
git reset --hard HEAD~1
```

## 11. View history

``` bash
git log --oneline --graph --decorate --all
```

## 12. Compare branches

Files changed:

``` bash
git diff develop..UI
```

Commit differences:

``` bash
git log develop..UI --oneline
```

## 13. Delete a branch

Local:

``` bash
git branch -d UI
```

Force delete:

``` bash
git branch -D UI
```

Remote:

``` bash
git push origin --delete UI
```

## 14. Common workflows

### Start new feature

``` bash
git switch develop
git pull origin develop
git switch -c feature/login
```

### Finish feature

``` bash
git add .
git commit -m "Finish login"
git push
```

Create a Pull Request.

### Keep feature updated

``` bash
git switch develop
git pull origin develop
git switch feature/login
git merge develop
```

### Accidentally committed to develop

``` bash
git switch -c feature/fix

git switch develop
git reset --hard origin/develop
```

Push your feature branch instead.

## 15. Useful commands

``` bash
git status
git branch
git branch -a
git remote -v
git fetch
git pull
git push
git stash
git log --oneline --graph --decorate --all
```

## 16. Best practices

-   Never work directly on `main`.
-   Pull `develop` before starting new work.
-   Commit often with meaningful messages.
-   Push regularly.
-   Merge `develop` into long-running branches frequently.
-   Resolve conflicts immediately.
-   Verify with `git status` before switching branches.
-   Create Pull Requests instead of pushing directly to protected
    branches.
