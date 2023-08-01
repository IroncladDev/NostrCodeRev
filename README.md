# Nostrit

Nostrit is a simple Nostr vending machine (Client & Server) that allows you to perform different jobs for an amount of sats.

**Note**: In order for the extension (client) to run, the [Server](https://replit.com/@IroncladDev/NostritServer) must first be running.

Current jobs include:
 - Code Reviews
 - Image Generation (Clipdrop/Stable Diffusion)

The Client is a Replit Extension which you can install and use in the Replit Workspace.
 - [Github Repo](https://github.com/IroncladDev/NostrCodeRev)
 - [Repl Link](https://replit.com/@IroncladDev/Nostrit)
 - [Demo Link](https://replit.com/extension/@IroncladDev/88c127f7-dbda-442c-b080-34d42944c086)

The Server is a simple and lightweight Typescript Nostr event listener and emitter.
 - [Github Repo](https://github.com/IroncladDev/NostritServer)
 - [Repl Link](https://replit.com/@IroncladDev/NostritServer)

Nostrit is a refactor of [@kody](https://replit.com/@kody)'s [Nostr DVM AI Client Tutorial](https://replit.com/@kody/Tutorial-for-AI-Nostr-DVM-Client-and-Service-Bounties).  I completely refactored the frontend and backend to use cleaner and more efficient code, added the git diffing feature for code reviews, and implemented the Stable Diffusion Nostr job.

While refactoring the code, I though I smelled a Rust developer amongst the legions of Typescript Errors 😅

## Demo Video 

If you can't see it, [click here](https://cdn.discordapp.com/attachments/963507913660440726/1135983105413500999/Nostrit-demo.mp4)

![Demo Video](https://cdn.discordapp.com/attachments/963507913660440726/1135983105413500999/Nostrit-demo.mp4)

---

Built for AI4All's [Nostr Data Vending Machine Bounty](https://replit.com/bounties/@Fedi/35-ai4all-build-a-no).
