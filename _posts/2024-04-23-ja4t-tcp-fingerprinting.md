---
permalink: ja4t-tcp-fingerprinting
layout: post

title: JA4T - TCP Fingerprinting
author: John Althouse
date: 2024-04-23
headshot-loc: /assets/img/headshots/john.jpg
image: /assets/img/2024-04-23/ja4tgif.gif
---

## TL;DR

JA4T/S/Scan are the latest additions to the JA4+ family of network fingerprinting tools.

| Full Name | Short Name | Description |
|---|---|---|
| JA4TCP | JA4T | Passive TCP Client Fingerprinting |
| JA4TCPServer | JA4TS | Passive TCP Server Response Fingerprinting |
| JA4TCPScan | JA4TScan | Active TCP Server Fingerprinting |

These tools add the ability to fingerprint client and server operating systems, devices, particular applications, hosting characteristics, and even if a connection is going through a tunnel, VPN, or proxy. If built into a WAF, firewall, or load balancer, it becomes possible to block malicious traffic.

Included is an explanation for how to block 60% of all internet scan traffic using JA4T fingerprints of known scanners, based on GreyNoise data, and how to block them with F5 Big-IPs. See “Blocking Internet Scanners” below for details.

JA4+: [https://github.com/FoxIO-LLC/ja4](https://github.com/FoxIO-LLC/ja4)
JA4TScan: [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)
Original blog on JA4+: [https://blog.foxio.io/ja4%2B-network-fingerprinting](https://blog.foxio.io/ja4%2B-network-fingerprinting)

This project was inspired by [p0f](https://lcamtuf.coredump.cx/p0f3/) (Michał Zalewski), [Hershel+](https://github.com/zk7/hershelplus) (Zain Shamsi & Dmitri Loguinov), and [gait](https://github.com/sandialabs/gait/tree/main) (Charles Smutz & Brandon Thomas). You guys are amazing!

## TCP Refresher

![tcp](/assets/img/2024-04-23/tcp.gif)
Go, Packets, Go!

TCP connections start with a TCP 3-way handshake. First, the client sends a TCP packet with the SYN flag to the server with its preferred TCP communication settings. If listening, the server will respond with a SYN-ACK packet and its preferred TCP communication settings. Then, the client will send an ACK, immediately followed by the application request, which could be HTTPS, SSH, etc. If the server is listening with that application protocol it will begin application communication. The connection is closed with a FIN ACK and the other side agrees with an ACK.

If one side does not respond with an ACK, the other side will retransmit the packet(s) several times at varying intervals before giving up. The number of retransmissions and the time interval between them is dependent on the operating system’s netcode.

![TCP SYN packet and the parts that we are looking at](/assets/img/2024-04-23/tcp.png)

The communication settings in the initial SYN and SYN-ACK packets are determined by the netcode used in the operating system. A Window Size, the maximum amount of data to be transmitted before an ACK is needed, is limited to two bytes and is a required field. TCP options are not required but are used by every modern operating system.

Common TCP Options Used:

| Hex | Kind | Byte Length | Meaning |
|---|---|---|---|
| 0x00 | 0 | 1 | End of Options List |
| 0x01 | 1 | 1 | No-Operation (NOP) |
| 0x02 | 2 | 4 | Maximum Segment Size |
| 0x03 | 3 | 3 | Window Scale |
| 0x04 | 4 | 2 | SACK Permitted |
| 0x08 | 8 | 10 | Timestamps |

There are [many other TCP options](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xhtml) going up to Kind 254, though they are mostly used in specialized environments (think SCADA and Mainframes). The total length of the TCP options list must be evenly divisible by 4. That is the reason why the NOP option exists, to pad out the options list length to a divisible byte count.

The Window Scale acts as a multiplier for the Window Size, allowing the actual Window Size to be much larger than 65535. For example, if the Window Size is 64240 and the Window Scale is set to 8, then the actual Window Size is 64240\*2\^8, or 16445440.

The Maximum Segment Size (MSS) is the largest data payload size that the source will accept per packet and is dependent on the overhead in the network connection. For example, the most common Maximum Segment Size (MSS) initially set is 1460, based on an ethernet MTU of 1500. Observing an MSS of 1380 would indicate that there is overhead on the network path, such as a tunnel or VPN, requiring a reduced MSS to account for the overhead. Different network conditions produce different amounts of overhead:

![MTU](/assets/img/2024-04-23/mtu.png)

Manually setting an MSS option to be higher than the actual available size will result in poor network performance, latency, and fragmentation.

## Previous TCP Fingerprinting Tools

Previous TCP fingerprinting tools, like Nmap (2006) and p0f (2013), are designed to fuzzy match with known operating systems and, as such, produce fingerprints that are not meant to be logged or used as pivot points in analysis but rather to be used to map back to an OS or device list. Their raw fingerprints include variable values like hop count which change from connection to connection, making it difficult to share raw fingerprint strings across the industry as each observer would see something slightly different depending on where they were observing. These tools were fantastic for their use case and are still very valuable today, many years after they came out.

![p0f](/assets/img/2024-04-23/p0f.png)

![hershel+](/assets/img/2024-04-23/herschel.png)

![Nmap](/assets/img/2024-04-23/nmap.png)

## JA4T: TCP Fingerprinting

JA4T is specifically designed to be logged alongside every session, highlighting unusual network conditions, and to be used as a pivot point in analysis, troubleshooting, threat hunting, and traffic shaping. It is human- and machine-readable, shareable, and can augment threat intel data. While still able to identify the OS/Device, JA4T also helps to identify intermediary proxies, VPNs, load balancers, tunneling, etc. JA4T can be deployed on any network device including netflow sensors, firewalls, WAFs, load balancers, and proxies.

![JA4T](/assets/img/2024-04-23/ja4tgif.gif)

JA4T - TCP Client Fingerprint Examples:

| OS / Device | JA4T |
|---|---|
| Windows 10 | 64240_2-1-3-1-1-4_1460_8 |
| Ubuntu 22.04 on Win10 WSL | 64240_2-4-8-1-3_1460_7 |
| AWS Windows Server 2022 | 62727_2-1-3-1-1-4_1460_8 |
| AWS Unix | 62727_2-4-8-1-3_1460_7 |
| AWS Unix over Fiber | 62727_2-4-8-1-3_8961_7 |
| Android 12 | 42600_2-4-8-1-3_1460_12 |
| Android 13 | 65535_2-4-8-1-3_1460_9 |
| OSX/iOS (all versions) | 65535_2-1-3-1-1-8-4-0-0_1460_6 |

Each operating system has different combinations of window size, options, and window scale. For example, Microsoft Windows does not utilize TCP Option 8 (timestamp), whereas all Unix-based operating systems do. iOS ends with a TCP Option 0 (End of list) whereas other operating systems do not. It’s interesting that iOS added another Option 0 to make their options list evenly divisible by 4 rather than removing an NOP (Option 1). This goes back to decisions the programmers made when building the netcode.

Changes in the MSS (part c), can help identify network conditions for the device. For example, each mobile carrier sets a different MSS for the overhead in their cell network:

![Mobile MSS](/assets/img/2024-04-23/mobile-n.png)

Which means we can identify the carrier that devices are on:

![Mobile Device](/assets/img/2024-04-23/mobile.png)

When a device is connected through a VPN, the MSS, and occasionally Window Size, are [changed](https://www.cloudflare.com/learning/network-layer/what-is-mss/) based on the overhead of the VPN and encryption ciphers used. When a device is connected through a Proxy, the TCP fingerprint of the proxy is seen on the server side, not the client. For example, the complete change in fingerprint when an iPhone connects through iCloud Relay:

| OS / Device | VPN / Proxy | JA4T |
|---|---|---|
| Windows 10 | None | 64240_2-1-3-1-1-4_1460_8 |
| Windows 10 | OpenVPN | 64240_2-1-3-1-1-4_1326_8 |
| Windows 10 | Wireguard VPN | 64860_2-1-3-1-1-4_1380_8 |
| iPhone | None | 65535_2-1-3-1-1-8-4-0-0_1460_6 |
| iPhone | OpenVPN | 65535_2-1-3-1-1-8-4-0-0_1326_6 |
| __iPhone__ | __iCloud Relay__ | __64240\_2-4-8-1-3\_1380\_13__ |

## JA4TS: TCP Server Response Fingerprint

While JA4T is based on the client’s TCP SYN packet, JA4TS is based on the SYN-ACK response.

TCP servers may respond to different client TCP SYN options differently. This means that any given server may produce multiple JA4TS fingerprints depending on the clients connecting to it. For example, if a client does not include TCP Option 4 (SACK), the server is not likely to include Option 4 in its SYN-ACK response. Thus making JA4TS a TCP Server Response Fingerprint. To get an accurate fingerprint of the Server itself, see JA4TScan in the section below.

Example of how the JA4TS of the same server changes depending on the client:

| Client      | JA4T                     | Server    | JA4TS                    |
| ----------- | ------------------------ | --------- | ------------------------ |
| Windows 10  | 64240_2-1-3-1-1-4_1460_8 | F5 BIG-IP | 14600_2-1-3-4-0-0_1460_0 |
| Linux       | 65535_2-4-8-1-3_1460_9   | F5 BIG-IP | 14600_2-1-3-4-8_1460_0   |
| Linux Proxy | 27920_2-4-8-1-3_1396_7   | F5 BIG-IP | 13960_2-1-3-4-8_1460_0   |
| NMap        | 1024_2_1460_00           | F5 BIG-IP | 14600_2_1460_00          |

## JA4TScan: Active TCP Server Fingerprinting

![ja4tscan](/assets/img/2024-04-23/ja4tscan.png)

JA4TScan is designed to produce a reliable TCP fingerprint of any server. It does this by actively scanning servers with a single SYN packet that includes all common TCP options to produce the most robust TCP SYN-ACK response from the server. It does not respond to the SYN-ACK from the server, but instead listens for retransmissions, counts the delay between each retransmission, and adds those delays to the end of the fingerprint as section e. If an RST packet is observed, it is also added to the fingerprint and prefixed with an “R”.

![ja4tscan-wireshark](/assets/img/2024-04-23/ja4tscan-wireshark.png)

TCP retransmissions, the number of retransmissions, and the delay between them are unique per operating system, as they are based on the OS netcode and the decisions of the engineers who wrote it. For example, some IoT devices send several retransmissions less than a second apart to attempt to reconnect as quickly as possible, while other devices will wait one second, retransmit, then wait two seconds, retransmit, then wait four seconds, retransmit, etc.

Example JA4TScan fingerprints:

| OS / Device       | JA4TScan                              |
| ----------------- | ------------------------------------- |
| AWS Linux 2       | 62727_2-4-8-1-3_8961_7_1-2-4-8-16     |
| Windows 10        | 64240_2-1-3-1-1-4_1460_8_1-2-4-8-R6   |
| Epson Printer     | 28960_2-4-8-1-3_1460_3_1-2-4-8-16     |
| Ubiquiti Router   | 43440_2-4-8-1-3_1460_12_1-2-4-8-17    |
| Ubiquiti Cameras  | 28960_2-4-8-1-3_1460_6_1-2-4-8-16     |
| Rachio IoT Device | 7168_2-3-0_1460_0_0-0-0-0-0-0-0-0-0-0 |
| Akamai CDN        | 65160_2-4-8-1-3_1348_7_1-2-4-8-16     |
| Cisco RV320/RV325 | 5792_2-4-8-1-3_1460_4_3-6-12-24       |

By incorporating the delay between TCP retransmission responses, we can build a very robust TCP fingerprint with only a single SYN packet. JA4TScan will be added to [Censys](https://censys.com/) and other tools later this year.

JA4TScan is available as a stand-alone tool here: [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)

## Blocking Internet Scanners with JA4T and GreyNoise

[GreyNoise](https://www.greynoise.io/) is a service that turns Internet noise into intelligence. As such, they can correlate data, such as fingerprints, across internet scanners. Correlating JA4T across GreyNoise allows for the grouping of threat actors and tools.

A list of top JA4T fingerprints seen scanning the internet over the last several weeks according to GreyNoise:

Top JA4T Fingerprints - GreyNoise.io April 2024:

| JA4T                   | OS / Application | % of Internet scan traffic |
| ---------------------- | ---------------- | -------------------------- |
| 1024_00_00_00          | masscan          | 21%                        |
| 65535_2_1460_00        | Modified ZMap    | 19%                        |
| 1025_2_1460_00         | Modified Nmap    | 8%                         |
| 65535_00_00_00         | ZMap             | 6%                         |
| 1024_2_1460_00         | Nmap             | 6%                         |
| 29200_2-4-8-1-3_1424_7 | Unknown/Tencent  | 5%                         |

The first 5 JA4T fingerprints, __which make up 60% of all internet scan traffic__, appear to be unique to those scanning applications and can be blocked using JA4T on your respective WAF, firewall, or load balancer. This allows for the heuristic blocking of malicious traffic based on fingerprints rather than constantly-changing IP lists. [F5](https://www.f5.com/) has an example iRule for blocking these JA4T fingerprints on F5 BIG-IPs [here](https://github.com/f5devcentral/f5-ja4).

When blocking based on JA4T, the block happens at the SYN packet, preventing a SYN-ACK response. This means that the traffic is blocked before the scanner can even tell if the port is up. As always, careful consideration should be used before implementing a block rule as these could end up also blocking your Attack Surface Management (ASM) tool.

Let’s dive into that last JA4T, _29200_2-4-8-1-3_1424_7_. An options list of 2-4-8-1-3 indicates a Unix-based operating system and an MSS of 1424 indicates that these connections have 36 bytes of additional network overhead. This is possibly an unencrypted tunnel or proxy, as 36 bytes is not enough for additional encryption as would be seen in a VPN. GreyNoise is observing hundreds of source IPs with this JA4T fingerprint, however, all are within Tencent IP ranges and listening on port 22, with some listening on port 31401, which is Pi Node Crypto Miner. Given the MSS discrepancy, it’s possible that these source IPs are not actually the true source of the traffic but instead that traffic is being bounced through them.

Pivoting on the JA4T with GreyNoise data, we can see this actor’s scanning priorities are primarily focused on SSH and alternative SSH ports:

![ports](/assets/img/2024-04-23/gn-ports.png)

Their second priority is web server identification. Comparing the top JA4H (HTTP Fingerprint) with this JA4T shows that they use a few different bots. Some are simple, while others try to look like a browser with their primary Accept-Language set to “zhcn”, which is Chinese-PRC. The case of _ge10nn04zhcn_, they’re using HTTP 1.0 as an attempt to connect to older devices:

![ja4h](/assets/img/2024-04-23/gn-ja4h.png)

Comparing the top JA4 (TLS Fingerprint) with this JA4T reveals that the actor uses a few variations of client hellos when scanning. Their primary scanner is a custom catch-all scanner that supports TLS 1.3, but, also, 69 ciphers — nice. Their other scanners support TLS 1.2 and 1.1, indicating that they’re looking to connect to both new and old systems with a variety of TLS client hellos. The one JA4 of _t11d6911h9_ is particularly odd because it’s TLS 1.1 with an ALPN extension, but ALPN didn’t exist in the days of TLS 1.1:

![ja4](/assets/img/2024-04-23/gn-ja4.png)

Combining this actor’s unusual JA4T with these unusual JA4H or JA4 fingerprints would make for great blocking or detection rules as it is the combination of JA4+ fingerprints that can facilitate creating detection and blocking rules with no false positives.

I want to thank GreyNoise, F5, and Arkime for their support of JA4+ in these investigations!

## Conclusion

JA4T, JA4TS, and JA4TScan are the latest additions to the JA4+ suite of network fingerprints. These tools add the ability to fingerprint client and server operating systems, devices, particular applications, hosting/provider characteristics, detect if a connection is going through a tunnel, VPN or proxy, and help troubleshoot network issues. If built into a WAF, firewall, or load balancer, it becomes possible to block 60% of internet scan traffic based on fingerprints rather than a list of constantly-changing IP addresses.

You can find JA4+ on our GitHub ([https://github.com/FoxIO-LLC/ja4](https://github.com/FoxIO-LLC/ja4)) and in many cyber security products.

JA4TScan is available as a stand alone tool here: [https://github.com/FoxIO-LLC/ja4tscan](https://github.com/FoxIO-LLC/ja4tscan)

F5 iRules for JA4+ along with an example of blocking traffic with JA4T are available here: [https://github.com/f5devcentral/f5-ja4](https://github.com/f5devcentral/f5-ja4)

JA4+ licensing details are [here](https://github.com/FoxIO-LLC/ja4/tree/main#licensing).

JA4T/S/Scan was created by: [John Althouse](https://www.linkedin.com/in/johnalthouse/)

With valuable feedback from:
Charles Smutz
Andy Wick
Joe Martin
Andrew Morris
Reid Huyssen
Tony Maszeroski
Greg Lesnewich
Jo Johnson
Timothy Noel
Gary Lipsky

And engineers working at AWS, F5, GreyNoise, Hunt, Censys, and others.
