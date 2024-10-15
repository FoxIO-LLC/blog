---
permalink: introducing-eva-the-employee-verification-app
layout: post

title: "Introducing EVA — The Employee Verification App"
author: John Althouse
date: 2024-10-14
headshot-loc: /assets/img/headshots/john.jpg
linkedin-loc: https://www.linkedin.com/in/johnalthouse/
x-loc: https://x.com/4A4133
image: /assets/img/2024-10-14/mockup.webp
---

And the solution to Employee AI / Voice Phishing

## TL;DR

EVA is a chat app that prevents voice phishing and AI-assisted phishing attacks within organizations by giving employees the ability to validate each other via MFA, in seconds. It also assists in secure incident response and securing business processes. This will stop your next red team engagement or ransomware attack in its tracks. EVA takes just a few minutes to set up; you can try it for free here: [https://eva.foxio.io/](https://eva.foxio.io/)

EVA was created by [FoxIO](https://foxio.io/), a cyber innovations company responsible for standards such as [JA4+ Network Fingerprinting](https://blog.foxio.io/ja4%2B-network-fingerprinting), which are used by global governments and most of the Fortune 500.

{% lightbox /assets/img/2024-10-14/mockup.webp --data="/assets/img/2024-10-14/mockup.webp" --title="EVA displayed on a laptop" --class="mx-auto" %}

## The (AI-Assisted) Voice Phishing Problem

Voice phishing, or vishing, as it is sometimes called, is the practice where a malicious actor calls or texts an employee’s phone pretending to be another employee. The actor often creates a sense of urgency with the employee, requesting help, access, or anything else that can help the threat actor achieve their goals. In these situations, employees are usually skeptical of the call, but because they lack any means of validating that the other person is who they say they are, they tend to follow through with the request.

For some recent examples, see:
[Finance worker pays out $25 million after video call with deepfake ‘CFO’](https://www.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk/index.html)

[Cybercriminals Impersonate Chief Exec’s Voice with AI Software Losing $243,000](https://www.darkreading.com/cyber-risk/cybercriminals-impersonate-chief-exec-s-voice-with-ai-software)

[MGM Loses $100 Million After Attacker Calls Helpdesk Pretending to be Employee](https://www.vox.com/technology/2023/9/15/23875113/mgm-hack-casino-vishing-cybersecurity-ransomware)

And most of us have experienced receiving texts from the “CEO” asking us to urgently buy gift cards. The solution to phishing is not user education, it’s in giving users the tools to easily verify everything.

## The Employee Verification App (EVA)

<iframe width="560" height="315" class="mx-auto" src="https://www.youtube.com/embed/DzyT3B-nlOU?si=6RsDXGmnncjdECG8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

EVA is an app that can be added to your company’s existing communication platform, (e.g., Slack, Teams), and interfaces with your existing multi-factor authentication (MFA) provider (e.g., Okta, Google). The app enables employees to validate each other via MFA within seconds. The app has been specifically designed to be as simple and easy to use as possible so that anyone would be able to use it within seconds, even if they’ve never used it before.

**Example Scenario 1:**

A threat actor sends Alice a phishing email.

Alice then receives a phone call. The person on the line says their name is John and that they’re from the company’s cyber security department. John says they detected malware on Alice’s workstation that was installed after she clicked on a phishing email. John says he needs access to Alice’s machine immediately to determine the extent of the infection.

Alice tells John, “Company policy is that I verify you first.” Alice types “/eva-verify @John” into the company’s Slack workspace. This sends John a message asking if he is talking with Alice right now with two buttons, Approve or Deny.

{% lightbox /assets/img/2024-10-14/user_verification_request.webp --data="/assets/img/2024-10-14/user_verification_request.webp" --title="User verification request" --class="mx-auto" %}

If John clicks Approve, then he is redirected to the company’s MFA login to prove that he is, indeed, John and that his Slack account has not been compromised. This is because it is easy to steal a Slack session token, but difficult to steal a MFA device. If John successfully logs in, then EVA messages both parties to let them know that John has verified his credentials.

{% lightbox /assets/img/2024-10-14/user_verification_response.webp --data="/assets/img/2024-10-14/user_verification_response.webp" --title="User verification response" --class="mx-auto" %}

If John clicks Deny or does not respond before the timeout window closes, both parties are notified and Alice is told by EVA to terminate the call immediately. This empowers Alice to hang up on the person without concern of reprisal because the company has told her to do so.

{% lightbox /assets/img/2024-10-14/user_verification_timed_out.webp --data="/assets/img/2024-10-14/user_verification_timed_out.webp" --title="User verification timed out" --class="mx-auto" %}

**Example Scenario 2:**

Charles is told to wire $3M to an account. Company policy is that another person must approve of a transfer this large.

Normally Charles would walk over to Deanna’s desk to get the approval in person but Deanna is working from home today. So Charles gets the approval from Deanna via Slack and to ensure that it is actually her, he verifies her by running “/eva-verify @Deanna” and configures the message with the identification number of the transaction. Deanna approves and verifies her credentials.

This second-person verification along with the transaction ID is then added to the EVA logs for automated auditing of wire transfer approvals.

**Example Scenario 3:**

[JA4+](https://blog.foxio.io/ja4%2B-network-fingerprinting) detects a reverse SSH shell from Chris’s system into production.

A security analyst sends a Slack message to Chris asking if he opened this connection. Chris says he did because he was tired of logging in through the Bastion server. He says he won’t do it again. To ensure that Chris is the person on the other end of this chat, the security analyst runs “/eva-verify @chris” and sets the message to “Did you set up a reverse SSH shell into prod?” Chris clicks “Approve” but is unable to authenticate via MFA because, plot twist, it’s not Chris. The threat actor has access to Chris’s system, but does not have access to Chris’s MFA device and therefore cannot complete the EVA verification.

The security analyst is notified of the timeout failure and spins up a security incident.

{% lightbox /assets/img/2024-10-14/user_verification_request_dialog.webp --data="/assets/img/2024-10-14/user_verification_request_dialog.webp" --title="User verification request dialog" --class="mx-auto" %}

## Configuration and Support

After adding EVA to your communication platform, run “/eva-configure” to set it up. All default messages and timeout windows are configurable by administrators, but are also one-time configurable by the user at the time of sending.

Our documentation explains how to generate an MFA provider API token for EVA to use that has the minimum necessary permissions to request that someone authenticate, as well as to know if they authenticated.

EVA abides by the principle of least privilege. As such, EVA has the minimum amount of permissions necessary for its purpose with no other permissions. EVA cannot read channels, cannot read chats, and cannot take actions on behalf of users.

EVA logs can be downloaded from the app manually or automatically.

We have built the first version of EVA for Slack, and the app currently supports Okta as an MFA provider. We are actively adding support for more MFA providers and are building EVA for Microsoft Teams. Please let us know what communication platform/MFA provider combination or additional features you would like to see by emailing us at [info@foxio.io](mailto:info@foxio.io). We will prioritize the top requests.

EVA is patent pending.

## Q&A (this will be updated as the questions come in)

**Q: Won’t this create MFA fatigue?**

A: Users only get to the MFA part if someone is trying to verify them and they are that actual person. This should be extremely rare as each user rarely calls another user asking for something critical.

In the case where a scammer is, for example, requesting gift cards from multiple users pretending to be the same person, that person may receive a lot of EVA verification requests, but since it’s not them, they can simply click Deny or ignore the requests triggering a timeout. In either case, EVA will alert the requesting user that it’s not them. No interaction with MFA is needed unless that person is actually requesting a bunch of gift cards from different people, which shouldn’t happen.

In short, this will not cause MFA fatigue. You could think of EVA as a fire extinguisher, use of it by any individual should be extremely rare but you’ll be glad you had it when you needed it.

**Q: This is a great idea! Why don’t we just build it ourselves?**

A: This is the classic Buy vs. Build argument. We’ve designed this to be extremely inexpensive as our goal is to end employee phishing. It should be vastly cheaper and faster to implement than building. Another pitfall of building is if the person or team who built it leaves, then the project can become abandoned. We’ll always be here to help.

If there’s any features you want that are missing, just ask, we’ll get them in so you can hit the ground running immediately.

## Conclusion

The Employee Verification App (EVA) empowers every employee with the ability to validate that any other employee is who they say they are, in seconds. EVA solves employee AI and voice phishing and assists in incident response and company policy enforcement. The solution to phishing is not user education, it’s in giving users the tools they need to stop the threat.

EVA is free to use for 90 days. After that, use promo code “EARLY” at checkout to lock in EVA at $0.25/user/month for life. This promotional price will never increase for organizations that sign up in 2024.

Try EVA today; setup takes only minutes: [https://eva.foxio.io/](https://eva.foxio.io/)
