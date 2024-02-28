<!-- markdownlint-configure-file { "MD013": { "line_length": 120 } } -->

# FoxIO blog powered by Jekyll and hosted on GitHub Pages

This is the source code for the FoxIO blog.
GitHub makes it easy to host the FoxIO blog for free using the Ruby-based Jekyll static site generator.
Jekyll makes it easy to write, edit, and preview posts.

## One-time setup

Install Ruby
<https://www.ruby-lang.org/en/downloads/>

Install Jekyll and its dependencies
```bundle install```

Install pre-commit
<https://pre-commit.com/>

Install pre-commit git hooks
```pre-commit install```

Run pre-commit checks
```pre-commit run```

## Operation

Write posts in markdown (.md) and place the post files in the "_posts" directory

Preview the site
```serve.sh``` (Unix)
```serve.bat``` (Windows)
