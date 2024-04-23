<!-- markdownlint-configure-file { "MD013": { "line_length": 120 } } -->

# FoxIO blog powered by Jekyll and hosted on GitHub Pages

This is the source code for the FoxIO blog.\
GitHub makes it easy to host the FoxIO blog for free using the Ruby-based Jekyll static site generator.\
Jekyll makes it easy to write, edit, and preview posts.

## One-time setup

Install Ruby\
<https://www.ruby-lang.org/en/downloads/>

Install Jekyll and its dependencies\
```bundle install```

Install npm dependencies\
```npm install```

Install pre-commit\
<https://pre-commit.com/#install>

Install pre-commit git hooks\
```pre-commit install```

Run pre-commit checks\
```pre-commit run```

## Operation

Write your post in markdown (.md) inside of the "_posts" directory and name the file using the convention:\
```YYYY-MM-DD-title.md```

If your post contains an image(s), create a new directory inside of the "/assets/img" directory, name it using the convention:\
```YYYY-MM-DD```,\
upload your image(s) to that directory, and embed them in your post using markdown syntax:\
```![Caption](/assets/img/YYYY-MM-DD/filename)```

Preview the site\
```serve.sh``` (Unix)\
```serve.bat``` (Windows)
