---
permalink: investigating-surfshark-and-nordvpn-with-ja4t
layout: post

title: "Investigating Surfshark and NordVPN with JA4T"
author: John Althouse
date: 2024-05-14
headshot-loc: /assets/img/headshots/john.jpg
image: /assets/img/2024-05-14/ja4tgif.gif
---

Surfshark & NordVPN Route Certain Ports Through Proxies?

## TL;DR

This is an investigation of Surfshark and NordVPN using JA4TCP Fingerprinting.

We found that both Surfshark and NordVPN route certain ports through TCP proxies such as port 5060, which is only used for unencrypted phone calls. No other VPN providers proxy traffic in this way. The reason for the proxying is unknown. Additionally, we found that NordVPN’s proxy is misconfigured, causing increased latency and bandwidth usage.

Resources:\
**JA4+ Network Fingerprinting:** [https://github.com/FoxIO-LLC/ja4](https://github.com/FoxIO-LLC/ja4)\
**JA4+ Blog:** [https://blog.foxio.io/ja4%2B-network-fingerprinting](https://blog.foxio.io/ja4%2B-network-fingerprinting)\
**JA4TCP Blog:** [https://blog.foxio.io/ja4t-tcp-fingerprinting](https://blog.foxio.io/ja4t-tcp-fingerprinting)\
**JA4TScan:** [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)\
**NMap:** [https://nmap.org/](https://nmap.org/)\
**gait:** [https://github.com/sandialabs/gait](https://github.com/sandialabs/gait)

## Quick Refresher on JA4+ Fingerprinting

[JA4+](https://github.com/FoxIO-LLC/ja4) is a suite of network fingerprinting methods that are being implemented across the industry and consist of the following methods, with more being added on a regular basis:

{% lightbox /assets/img/2024-05-14/ja4+_methods.webp --data="/assets/img/2024-05-14/ja4+_methods.webp" --title="JA4+ methods" --class="mx-auto" %}

For this investigation, we are primarily utilizing JA4TCP (JA4T). You can read up on how JA4T works in [this blog post](https://blog.foxio.io/ja4t-tcp-fingerprinting). In short, it’s a collection of artifacts from the TCP SYN and SYN-ACK packets which make up the TCP three-way handshake. These fingerprints allow us to fingerprint client and server operating systems, devices, certain applications, hosting/provider characteristics, if a connection is going through a tunnel, VPN or proxy, and enable us to troubleshoot network issues.

{% lightbox /assets/img/2024-05-14/ja4tgif.gif --data="/assets/img/2024-05-14/ja4tgif.gif" --title="JA4T Gif" --class="mx-auto" %}

{% lightbox /assets/img/2024-05-14/examples.webp --data="/assets/img/2024-05-14/examples.webp" --title="JA4T examples" --class="mx-auto" %}

For this blog, we will also be focusing on the Maximum Segment Size (MSS) part of the JA4T/S fingerprint. The MSS is the largest data payload size that a source will accept per packet, and is dependent on the overhead in the network connection. For example, the most common Maximum Segment Size (MSS) initially set is 1460, based on an ethernet Maximum Transmission Unit (MTU) of 1500. Observing an MSS of 1380 indicates that there is overhead on the network path, such as a tunnel or VPN, requiring a reduced MSS to account for it. Unique network conditions produce different amounts of overhead:

{% lightbox /assets/img/2024-05-14/mtu.webp --data="/assets/img/2024-05-14/mtu.webp" --title="MTU" --class="mx-auto" %}

Setting the MSS option to be larger than the actual available size will result in poor network performance, latency, and fragmentation. [MSS Clamping](https://www.cloudflare.com/learning/network-layer/what-is-mss/) is a common method used to avoid this issue.

## Surfshark & NordVPN Route Certain Ports Through Proxies?

Nord Security and Surfshark merged in 2022, and, together, they are the world’s largest VPN provider. While testing [JA4T](https://blog.foxio.io/ja4t-tcp-fingerprinting) through NordVPN and listening on the server side, I noticed something odd in my network logs. Connections over port 443 from NordVPN had a JA4T of _65535\_2–4–8–1–3\_1460\_9_ (Unix), no matter what the client was. On the client side, I would see a normal-looking JA4T fingerprint where the MSS was 1380 (to account for the VPN overhead). So why does the server see a MSS of 1460? I tried connecting to the server using a different port, 8443, and only then did the server see the correct JA4T fingerprint of my client.

What is going on here? I did some further research, and here is what I found:

Observed network traffic on the **server** side:

{% lightbox /assets/img/2024-05-14/server_traffic.webp --data="/assets/img/2024-05-14/server_traffic.webp" --title="Observed network traffic on the server side" --class="mx-auto" %}

Why does the client TCP fingerprint change from Windows to Unix when connecting through Nord and Surfshark, but only over ports 80 and 443?

Observed network traffic on the **client** side:

{% lightbox /assets/img/2024-05-14/client_traffic.webp --data="/assets/img/2024-05-14/client_traffic.webp" --title="Observed network traffic on the client side" --class="mx-auto" %}

Why is the server’s TCP response fingerprint different when connecting through Nord and Surfshark, but only over ports 80 and 443?

When looking at latency measurements and hop counts with [JA4L](https://blog.foxio.io/ja4%2B-network-fingerprinting), I noticed that NordVPN and Surfshark would initiate the TCP three-way handshake from their exit node and that the hop counts were different, but only over ports 80 and 443. All of these observations led me to believe that NordVPN and Surfshark are rerouting certain ports to proxies that intercept the TCP connection.

To confirm this theory, I ran a SYN scan of all ports against an IP address for which no server exists. The scan should return no results since the destination server does not exist. However, both NordVPN and Surfshark responded on the following ports, which confirms that they are routing these ports through TCP proxies:

{% lightbox /assets/img/2024-05-14/tcp_proxy_ports.webp --data="/assets/img/2024-05-14/tcp_proxy_ports.webp" --title="Surfshark and NordVPN TCP proxy ports" --class="mx-auto" %}

If you have NordVPN or Surfshark, you can test this yourself by running:

`nmap -v -Pn -n 203.0.113.100` (or use any other IP that is not in use)

{% lightbox /assets/img/2024-05-14/nmap.webp --data="/assets/img/2024-05-14/nmap.webp" --title="Nmap scan on unused port" --class="mx-auto" %}

[Telegram](https://telegram.org/) is a service that runs over several ports, including ports 80 and 443. Telegram does not use TLS but instead uses [MTProto](https://core.telegram.org/mtproto), a proprietary protocol that encrypts messages over several protocols, including HTTP. I connected directly to Telegram and then connected through NordVPN to see if there was a difference:

{% lightbox /assets/img/2024-05-14/telegram.webp --data="/assets/img/2024-05-14/telegram.webp" --title="Connecting to Telegram directly vs. connecting via NordVPN" --class="mx-auto" %}

When connecting directly, the client sends an HTTP POST to the server. The server responds with an ACK, then a FIN ACK to close the connection. When connecting over NordVPN, the client sends an HTTP POST to the server, the server responds with an HTTP 200 OK, and then both the client and the server send FIN ACKs to close the connection.

This discrepancy is interesting. I don’t know what the reason is, but it is repeatable.

I tested this with other VPN providers, including Private Internet Access and Proton VPN, but did not observe the same behavior. The discrepancy appears to be unique to Surfshark and NordVPN. So, why are they running only these ports through TCP proxies?

…

Let’s assume that it’s for performance reasons, perhaps as a load-balancing strategy.

NordVPN’s TCP proxy has a JA4T of _65535\_2–4–8–1–3\_1460\_9_. Notice the MSS of 1460.

The actual client’s JA4T is _64860\_2–1–3–1–1–4\_1380\_8_. Notice the MSS of 1380 due to the VPN overhead.

Advertising an MSS higher than what the client can accept should result in worse performance, not better. I tested this theory by connecting to a website with NordVPN over port 443 (through their proxy) and over port 8443 (bypassing the proxy). The results were as expected:

{% lightbox /assets/img/2024-05-14/nordvpn_options.webp --data="/assets/img/2024-05-14/nordvpn_options.webp" --title="Connecting to a website with NordVPN over port 443 and port 8443" --class="mx-auto" %}

When bypassing Nord’s proxy, the server sends data with a packet size of 1380: the maximum segment size of the VPN connection. In this test, 381 packets were sent back and forth to load the webpage completely.

When going through Nord’s proxy, the server sends packets with the requested segment size of 1460. The proxy, unable to forward those packets to the client because the client can only handle 1380, sends hundreds of TCP SACKs to the server with updated Window Sizes, essentially asking the server to resend the previous packets, but at smaller sizes. As a result, 962 packets were needed to load the same webpage. This back-and-forth increased latency for the client and doubled the bandwidth between NordVPN and the server, as the server had to send the same data twice.

So, the proxies are not for performance reasons?

Interestingly, Surfshark’s TCP proxy has a JA4T of _65170\_2–4–8–1–3\_1330\_10._ Notice the MSS of 1330, which is the correct size given the overhead of the VPN and the proxy, and therefore does not suffer the performance impact that Nord has.

Because of this, I believe that NordVPN is using a similar proxy infrastructure to Surfshark’s — for still unknown reasons — but NordVPN has its proxy misconfigured by not [clamping MSS](https://www.cloudflare.com/learning/network-layer/what-is-mss/) to 1330, like Surfshark. Fixing this will reduce latency for customers and reduce NordVPN’s infrastructure cost.

Both NordVPN and Surfshark tout the ability to block viruses and ads, so perhaps the proxies are related to that. But then why proxy port 5060, which is only used for unencrypted phone calls? I contacted NordVPN to find out — there has to be a good reason:

{% lightbox /assets/img/2024-05-14/nordvpn_contact.webp --data="/assets/img/2024-05-14/nordvpn_contact.webp" --title="NordVPN contact query" --class="mx-auto" %}

{% lightbox /assets/img/2024-05-14/nordvpn_response.webp --data="/assets/img/2024-05-14/nordvpn_response.webp" --title="NordVPN contact response" --class="mx-auto" %}

It appears that at least the support team is unaware of the proxy servers.

Other potential reasons for the proxies include being a [transparent caching web proxy](https://www.imperva.com/learn/ddos/transparent-proxy/). [DNS RPZ](https://dnsrpz.info/) may account for port 53. [CALEA](https://www.fcc.gov/calea) could explain port 5060, but so could [SRTP](https://learn.microsoft.com/en-us/openspecs/office_protocols/ms-sdpext/d2c16650-cefb-4f77-acbe-b958e909135b). Any assumptions would be pure speculation without more data and therefore this blog makes none.

I hate to end this blog with more questions than answers, so I will post an update if I find out more. Until then, this was an interesting hunt that, at the very least, found performance misconfigurations at NordVPN, all triggered by an unexpected JA4T fingerprint in my network logs.

### UPDATE 5/15/2024

NordVPN has responded.

{% lightbox /assets/img/2024-05-14/nordvpn_response_2.webp --data="/assets/img/2024-05-14/nordvpn_response_2.webp" --title="NordVPN X response" --class="mx-auto" %}

That patent is [https://patents.google.com/patent/US11632267B2/en](https://patents.google.com/patent/US11632267B2/en) which looks to be a method of offloading TCP overhead through a VPN connection. The idea being that if a connection is lossy (think mobile phone with a poor signal), the TCP retransmissions are only on one side of the connection rather than all the way back and forth.

This makes sense and the patent would explain why we’re not seeing this from other VPN vendors. Though, I’m still confused about the amount of TCP SACKS seen from NordVPN on the server side as well as the discrepancy in MSS between Nord and Surfshark. That still may be worth a look on their end.

In any case, I hope this blog demonstrates the relevance and value of analyzing all of the low-level aspects of connections. Thanks to NordVPN for the explanation!
