---
permalink: cut-siem-%26-ai-cost-by-80-with-logslash-%26-cwolves
layout: post

title: Cut SIEM & AI cost by 80% with LogSlash & cwolves
author: John Althouse
date: 2023-06-15
headshot-loc: /assets/img/headshots/john.jpg
image: /assets/img/2023-06-15/cwolves_dashboard.webp
---

In this blog, I go over how the LogSlash method has evolved over the last few months and new technologies that it is being implemented into. I’ll also explain how LogSlash can significantly reduce the cost to send data to SIEMs as well as train AI on transactional data.

## TL;DR

LogSlash can reduce the cost of your logging infrastructure and the cost to train AI models on transactional data by 80%.

cwolves is a startup that uses AI to automatically LogSlash and normalize any log type. It is extremely performant and cost effective. They created a Splunk plugin for LogSlash.

LogSlash has also been tested on Vector, Logstash, Python, Kafka, and Cribl. Performance and ease of use are key.

LogSlash code is available here: [https://github.com/FoxIO-LLC/LogSlash](https://github.com/FoxIO-LLC/LogSlash)

LogSlash is patented and licensed under the FoxIO License which is permissive for most use cases, including internal business use. The main use case it’s not permissive for is monetization, that requires a separate OEM license which helps fund further R&D.

## Background on LogSlash

We released LogSlash, a method for reducing log volume without reducing analytical value, in [this blog post from January](/introducing-logslash-and-the-end-of-traditional-logging). Here’s a quick refresher on how LogSlash works:

LogSlash intelligently reduces similar logs within a defined time window down to a single log line. For example, if an IP communicates to another IP 100 times a minute, instead of logging 100 log lines, LogSlash produces 1 log that says the event happened 100 times within that minute. Analytical value is retained while data volume is drastically reduced.

{% lightbox /assets/img/2023-06-15/logslash.webp --data="/assets/img/2023-06-15/logslash.webp" --title="Simplified example of how LogSlash works" --class="mx-auto" %}
<figcaption class="text-center">Simplified example of how LogSlash works</figcaption>

Over the past few months we’ve worked with several large companies and have found that our initial estimate of 50% volume savings was wrong. These businesses are actually seeing around 80% log volume reduction when using LogSlash. Multiply those savings across trillions of logs and you can see how the cost benefit can be quite enormous, allowing organizations the headroom to send logs to their SIEM that they otherwise couldn’t afford.

LogSlash isn’t just for SIEMs. Training AI models on transactional data is becoming increasingly common and extremely expensive. Running these logs through LogSlash prior to training the AI model on them can save an equal amount of training time and compute. You just want to make sure your model supports the “logslash” field so it knows how to duplicate the occurrences of data while training on LogSlashed logs.

## Development

The LogSlash method is designed to be implemented into many existing technologies and languages. The difference between them comes down to performance and ease of configuration, as each log type requires its own configuration. We originally released LogSlash as a set of Vector.dev scripts. They worked but the scripts proved to be extremely complicated and time consuming to create.

{% lightbox /assets/img/2023-06-15/vector_script.webp --data="/assets/img/2023-06-15/vector_script.webp" --title="Vector script" --class="mx-auto" %}

[Steven Hostetler](https://www.linkedin.com/in/steven-hostetler/) released LogSlash as a Logstash config. [Slash-N-Stash](https://github.com/FoxIO-LLC/LogSlash/tree/main/Logstash) worked well but again, it took a lot of effort to build the config and get it working correctly.

{% lightbox /assets/img/2023-06-15/slash_n_stash_repo.webp --data="/assets/img/2023-06-15/slash_n_stash_repo.webp" --title="Slash-N-Stash repository" --class="mx-auto" %}

We developed LogSlash on Python and Kafka but the performance was so cost prohibitive that it wasn’t even worth releasing as the cost to run LogSlash needs to be infinitesimal compared to the savings.

We developed LogSlash on Cribl and this was a bit easier to develop compared to Vector and Logstash. However, it still requires you to build a different config for each log type and you need a Cribl license which is volume based. We’ve yet to test it at scale so performance impact is still unknown.

## Enter cwolves

That brings us to cwolves, a startup entirely based around the LogSlash method and a licensee of FoxIO. They’re using a small AI model to recognize log field names, normalize them, and determine how to configure LogSlash to handle those fields. This means there’s no need to build normalization and LogSlash configs, those are now done automatically. The performance is incredible too.

The AI-based normalization and config builder is brilliant. For example, if your log uses the field name “data\_win\_eventdata\_ip\_src”, it automatically recognizes that as “Source IP” and knows how to configure LogSlash for that field. It will present you with the configuration it built so you can still manually modify it how you see fit, but the effort of building these configs is now gone. Amazing! For some organizations, cwolves may be worth it just for the auto-normalization alone.

{% lightbox /assets/img/2023-06-15/cwolves_dashboard.webp --data="/assets/img/2023-06-15/cwolves_dashboard.webp" --title="cwolves dashboard" --class="mx-auto" %}

That’s LogSlash configuration writing and performance taken care of. Another hurdle is implementation. cwolves aims to solve this with easy cloud or on-prem implementation with the ability to get started on-cloud, in minutes, for free. This is a great way to test out LogSlash though I suspect that most organizations will want this on-prem or within their own VPC, so it’s great that they offer that option.

The final hurdle to LogSlash is SIEM and AI model support. That is, they need to be aware that if the field “logslash=” exists in the log line, then it needs to duplicate the occurrence of each field by the logslash value while dividing fields that end in \_total by the logslash value. This is straightforward to implement and cwolves is already developing a Splunk App that does just this.

{% lightbox /assets/img/2023-06-15/splunk_dashboard.webp --data="/assets/img/2023-06-15/splunk_dashboard.webp" --title="Splunk dashboard" --class="mx-auto" %}

With that Splunk App, cwolves makes LogSlash ready to go for existing Splunk customers. It also makes Splunk suddenly affordable and an attractive option for those who are SIEM shopping.

Try out LogSlash and cwolves at [https://cwolves.com/](https://cwolves.com/)

[Contact us](mailto:john@foxio.io) at FoxIO if you’d like to know more about LogSlash or if you’re interested in an OEM license.
