---
permalink: ja4t-tcp-fingerprinting
layout: post

title: "JA4T: TCP Fingerprinting"
author: John Althouse
date: 2024-04-23
headshot-loc: /assets/img/headshots/john.jpg
linkedin-loc: https://www.linkedin.com/in/johnalthouse/
x-loc: https://x.com/4A4133
image: /assets/img/2024-04-23/tcp.gif
---

And How to Use It to Block Over 80% of Internet Scan Traffic

## TL;DR

JA4T/S/Scan are the latest additions to the JA4+ family of network fingerprinting tools.

{% lightbox /assets/img/2024-04-23/ja4tcptable.webp --data="/assets/img/2024-04-23/ja4tcptable.webp" --title="Comparison of JA4T, JA4TS, and JA4TScan" --class="mx-auto" %}

These tools add the ability to fingerprint client and server operating systems, devices, particular applications, hosting characteristics, and even if a connection is going through a tunnel, VPN, or proxy. If built into a WAF, firewall, or load balancer, it becomes possible to block malicious traffic.

JA4+: [https://github.com/FoxIO-LLC/ja4](https://github.com/FoxIO-LLC/ja4)\
JA4TScan: [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)\
Original blog on JA4+: [https://blog.foxio.io/ja4%2B-network-fingerprinting](https://blog.foxio.io/ja4%2B-network-fingerprinting)

This project was inspired by [p0f](https://lcamtuf.coredump.cx/p0f3/) (Michał Zalewski), [Hershel+](https://github.com/zk7/hershelplus) (Zain Shamsi & Dmitri Loguinov), and [gait](https://github.com/sandialabs/gait/tree/main) (Charles Smutz & Brandon Thomas). You guys are amazing!

## TCP Refresher

{% lightbox /assets/img/2024-04-23/tcp.gif --data="/assets/img/2024-04-23/tcp.gif" --title="Attempting to use a page from the children's book, “Go Dog. Go!” to explain TCP." --class="mx-auto" %}
<figcaption class="text-center">Attempting to use a page from the children's book, “Go Dog. Go!” to explain TCP.</figcaption>

TCP connections start with a TCP 3-way handshake. First, the client sends a TCP packet with the SYN flag to the server with its preferred TCP communication settings. If listening, the server will respond with a SYN-ACK packet and its preferred TCP communication settings. Then, the client will send an ACK, immediately followed by the application request, which could be HTTPS, SSH, etc. If the server is listening with that application protocol it will begin application communication. The connection is closed with a FIN ACK and the other side agrees with an ACK.

If one side does not respond with an ACK, the other side will retransmit the packet(s) several times at varying intervals before giving up. The number of retransmissions and the time interval between them is dependent on the operating system’s netcode.

{% lightbox /assets/img/2024-04-23/tcpsyn.webp --data="/assets/img/2024-04-23/tcpsyn.webp" --title="A TCP SYN packet and the parts that we are looking at." --class="mx-auto" %}
<figcaption class="text-center">A TCP SYN packet and the parts that we are looking at.</figcaption>

The communication settings in the initial SYN and SYN-ACK packets are determined by the netcode used in the operating system. A **Window Size**, the maximum amount of data to be transmitted before an ACK is needed, is limited to two bytes and is a required field. **TCP Options** are not required but are used by every modern operating system.

{% lightbox /assets/img/2024-04-23/tcpoptions.webp --data="/assets/img/2024-04-23/tcpoptions.webp" --title="Common TCP Options Used" --class="mx-auto" %}

There are [many other TCP options](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xhtml) going up to Kind 254, though they are mostly used in specialized environments (think SCADA and Mainframes). The total length of the TCP options list must be evenly divisible by 4. That is the reason why the NOP option exists, to pad out the options list length to a divisible byte count.

The **Window Scale** acts as a multiplier for the Window Size, allowing the actual Window Size to be much larger than 65535. For example, if the Window Size is 64240 and the Window Scale is set to 8, then the actual Window Size is 64240\*2⁸, or 16445440.

The **Maximum Segment Size (MSS)** is the largest data payload size that the source will accept per packet and is dependent on the overhead in the network connection. For example, the most common Maximum Segment Size (MSS) initially set is 1460, based on an ethernet MTU of 1500. Observing an MSS of 1380 would indicate that there is overhead on the network path, such as a tunnel or VPN, requiring a reduced MSS to account for the overhead. Different network conditions produce different amounts of overhead:

{% lightbox /assets/img/2024-04-23/mss.webp --data="/assets/img/2024-04-23/mss.webp" --title="MSS" --class="mx-auto" %}

Manually setting an MSS option to be higher than the actual available size will result in poor network performance, latency, and fragmentation.

## Previous TCP Fingerprinting Tools

Previous TCP fingerprinting tools, like Nmap (2006) and p0f (2013), are designed to fuzzy match with known operating systems and, as such, produce fingerprints that are not meant to be logged or used as pivot points in analysis but rather to be used to map back to an OS or device list. Their raw fingerprints include variable values like hop count which change from connection to connection, making it difficult to share raw fingerprint strings across the industry as each observer would see something slightly different depending on where they were observing. These tools were fantastic for their use case and are still very valuable today, many years after they came out.

{% lightbox /assets/img/2024-04-23/p0f.webp --data="/assets/img/2024-04-23/p0f.webp" --title="p0f" --class="mx-auto" %}
<figcaption class="text-center">p0f</figcaption>

{% lightbox /assets/img/2024-04-23/hershel+.webp --data="/assets/img/2024-04-23/hershel+.webp" --title="hershel+" --class="mx-auto" %}
<figcaption class="text-center">hershel+</figcaption>

{% lightbox /assets/img/2024-04-23/nmap.webp --data="/assets/img/2024-04-23/nmap.webp" --title="Nmap" --class="mx-auto" %}
<figcaption class="text-center">Nmap</figcaption>

## JA4T: TCP Fingerprinting

JA4T is specifically designed to be logged alongside every session, highlighting unusual network conditions, and to be used as a pivot point in analysis, troubleshooting, threat hunting, and traffic shaping. It is human- and machine-readable, shareable, and can augment threat intel data. While still able to identify the OS/Device, JA4T also helps to identify intermediary proxies, VPNs, load balancers, tunneling, etc. JA4T can be deployed on any network device including netflow sensors, firewalls, WAFs, load balancers, and proxies.

{% lightbox /assets/img/2024-04-23/ja4tgif.gif --data="/assets/img/2024-04-23/ja4tgif.gif" --title="JA4T Gif" --class="mx-auto" %}

{% lightbox /assets/img/2024-04-23/examples.webp --data="/assets/img/2024-04-23/examples.webp" --title="JA4T Examples" --class="mx-auto" %}

Each operating system has different combinations of window size, options, and window scale. For example, Microsoft Windows does not utilize TCP Option 8 (timestamp), whereas all Unix-based operating systems do. iOS ends with a TCP Option 0 (End of list) whereas other operating systems do not. It’s interesting that iOS added another Option 0 to make their options list evenly divisible by 4 rather than removing an NOP (Option 1). This goes back to decisions the programmers made when building the netcode.

Changes in the MSS (part _c_), can help identify network conditions for the device. For example, each mobile carrier sets a different MSS for the overhead in their cell network:

{% lightbox /assets/img/2024-04-23/mobilecarriers.webp --data="/assets/img/2024-04-23/mobilecarriers.webp" --title="Mobile Carrier MSSs" --class="mx-auto" %}

Which means we can identify the carrier that devices are on:

{% lightbox /assets/img/2024-04-23/mobilecarriersja4ts.webp --data="/assets/img/2024-04-23/mobilecarriersja4ts.webp" --title="Mobile Carrier JA4Ts" --class="mx-auto" %}

When a device is connected through a VPN, the MSS, and occasionally Window Size, are [changed](https://www.cloudflare.com/learning/network-layer/what-is-mss/) based on the overhead of the VPN and encryption ciphers used. When a device is connected through a Proxy, the TCP fingerprint of the proxy is seen on the server side, not the client. For example, the complete change in fingerprint when an iPhone connects through iCloud Relay:

{% lightbox /assets/img/2024-04-23/vpnja4ts.webp --data="/assets/img/2024-04-23/vpnja4ts.webp" --title="VPN JA4Ts" --class="mx-auto" %}

## JA4TS: TCP Server Response Fingerprint

While JA4T is based on the client’s TCP SYN packet, JA4TS is based on the SYN-ACK response.

TCP servers may respond to different client TCP SYN options differently. This means that any given server may produce multiple JA4TS fingerprints depending on the clients connecting to it. For example, if a client does not include TCP Option 4 (SACK), the server is not likely to include Option 4 in its SYN-ACK response. Thus making JA4TS a TCP Server _Response_ Fingerprint. To get an accurate fingerprint of the Server itself, see JA4TScan in the section below.

{% lightbox /assets/img/2024-04-23/clientdependentja4ts.webp --data="/assets/img/2024-04-23/clientdependentja4ts.webp" --title="Client dependency of JA4TS" --class="mx-auto" %}

## JA4TScan: Active TCP Server Fingerprinting

{% lightbox /assets/img/2024-04-23/ja4tscan.webp --data="/assets/img/2024-04-23/ja4tscan.webp" --title="JA4TScan" --class="mx-auto" %}

JA4TScan is designed to produce a reliable TCP fingerprint of any server. It does this by actively scanning servers with a single SYN packet that includes all common TCP options to produce the most robust TCP SYN-ACK response from the server. It does not respond to the SYN-ACK from the server, but instead listens for retransmissions, counts the delay between each retransmission, and adds those delays to the end of the fingerprint as section _e_. If an RST packet is observed, it is also added to the fingerprint and prefixed with an “R”.

{% lightbox /assets/img/2024-04-23/wiresharkja4tscan.webp --data="/assets/img/2024-04-23/wiresharkja4tscan.webp" --title="JA4TScan as seen in Wireshark" --class="mx-auto" %}
<figcaption class="text-center">JA4TScan as seen in Wireshark</figcaption>

TCP retransmissions, the number of retransmissions, and the delay between them are unique per operating system, as they are based on the OS netcode and the decisions of the engineers who wrote it. For example, some IoT devices send several retransmissions less than a second apart to attempt to reconnect as quickly as possible, while other devices will wait one second, retransmit, then wait two seconds, retransmit, then wait four seconds, retransmit, etc.

{% lightbox /assets/img/2024-04-23/exampleja4tscans.webp --data="/assets/img/2024-04-23/exampleja4tscans.webp" --title="Example JA4TScan fingerprints" --class="mx-auto" %}

By incorporating the delay between TCP retransmission responses, we can build a very robust TCP fingerprint with only a single SYN packet. JA4TScan will be added to [Censys](https://censys.com/) and other tools later this year.

JA4TScan is available as a stand-alone tool here: [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)

## Blocking Internet Scanners with JA4T and GreyNoise

[GreyNoise](https://www.greynoise.io/) is a service that turns Internet noise into intelligence. As such, they can correlate data, such as fingerprints, across internet scanners. Correlating JA4+ across GreyNoise allows for the grouping of threat actors and tools.

For example, one of the top JA4T fingerprints observed on GreyNoise is _29200_2–4–8–1–3_1424_7_. An options list of _2–4–8–1–3_ indicates a Unix-based operating system and an MSS of 1424 indicates that these connections have 36 bytes of additional network overhead. This is possibly an unencrypted tunnel or proxy, as 36 bytes is not enough for additional encryption as would be seen in a VPN. GreyNoise is observing hundreds of source IPs with this JA4T fingerprint, however, all are within Tencent IP ranges and listening on port 22, with some listening on port 31401, which is Pi Node Crypto Miner. Given the MSS discrepancy, it’s possible that these source IPs are not actually the true source of the traffic but instead that traffic is being bounced through them.

Pivoting on the JA4T with GreyNoise data, we can see this actor’s scanning priorities are primarily focused on SSH and alternative SSH ports:

{% lightbox /assets/img/2024-04-23/scanningpriorities.webp --data="/assets/img/2024-04-23/scanningpriorities.webp" --title="Scanning priorities" --class="mx-auto" %}

As this JA4T is unusual, it would be safe to block it when the destination port matches 22. However, there’s a potential for false positives in production applications over standard ports like 80 and 443. To block these, we can combine the JA4T with other JA4 fingerprints.

Their second priority is web server identification. Comparing the top JA4H (HTTP Fingerprint) with this JA4T shows that they use a few different bots. Some are simple, while others try to look like a browser with their primary Accept-Language set to “zhcn”, which is Chinese-PRC. In the case of _ge10nn04zhcn_, they’re using HTTP 1.0 as an attempt to connect to older devices:

{% lightbox /assets/img/2024-04-23/ja4hja4t.webp --data="/assets/img/2024-04-23/ja4hja4t.webp" --title="JA4H and JA4T fingerprints" --class="mx-auto" %}

Comparing the top JA4 (TLS Fingerprint) with this JA4T reveals that the actor uses a few variations of client hellos when scanning. Their primary scanner is a custom catch-all scanner that supports TLS 1.3, but, also, 69 ciphers — nice. Their other scanners support TLS 1.2 and 1.1, indicating that they’re looking to connect to both new and old systems with a variety of TLS client hellos. The one JA4 of _t11d6911h9_ is particularly odd because it’s TLS 1.1 with an ALPN extension, but ALPN didn’t exist in the days of TLS 1.1:

{% lightbox /assets/img/2024-04-23/ja4ja4t.webp --data="/assets/img/2024-04-23/ja4ja4t.webp" --title="JA4 and JA4T fingerprints" --class="mx-auto" %}

Combining this actor’s unusual JA4T with these unusual JA4H or JA4 fingerprints would make for great blocking or detection rules as it is the combination of JA4+ fingerprints that can facilitate creating detection and blocking rules with no false positives.

I want to thank GreyNoise, F5, and Arkime for their support of JA4+ in these investigations!

## Conclusion

JA4T, JA4TS, and JA4TScan are the latest additions to the JA4+ suite of network fingerprints. These tools add the ability to fingerprint client and server operating systems, devices, particular applications, hosting/provider characteristics, detect if a connection is going through a tunnel, VPN or proxy, and help troubleshoot network issues. If built into a WAF, firewall, or load balancer, it becomes possible to block unwanted traffic based on fingerprints rather than a list of constantly-changing IP addresses.

You can find JA4+ on our GitHub ([https://github.com/FoxIO-LLC/ja4](https://github.com/FoxIO-LLC/ja4)) and in many cyber security products.

JA4TScan is available as a stand alone tool here: [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)

F5 iRules for JA4+ along with an example of blocking traffic with JA4T are available here: [https://github.com/f5devcentral/f5-ja4](https://github.com/f5devcentral/f5-ja4)

JA4+ licensing details are [here](https://github.com/FoxIO-LLC/ja4/tree/main#licensing).

JA4T/S/Scan was created at [FoxIO](https://foxio.io/) by [John Althouse](https://www.linkedin.com/in/johnalthouse/).

With valuable feedback from:\
Charles Smutz\
Andy Wick\
Joe Martin\
Andrew Morris\
Reid Huyssen\
Tony Maszeroski\
Greg Lesnewich\
Jo Johnson\
Timothy Noel\
Gary Lipsky

And engineers working at AWS, F5, GreyNoise, Hunt, Censys, and others.
