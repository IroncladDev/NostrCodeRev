import { atom } from "jotai";
import { RelayStatus } from "./components/RelayConnection";
import NDK from "@nostr-dev-kit/ndk";

// Relay URLs
export const RELAYS = [
  "wss://relay.damus.io",
  "wss://nostr.swiss-enigma.ch",
  "wss://relay.f7z.io",
];

// Progress Result Type
export type ProgressResult =
  | null
  | "received"
  | "started"
  | "success"
  | "failed";

export enum RequestType {
  CodeReview = "Code Review",
  StableDiffusion = "Stable Diffusion",
}

// Relay-related atoms
export const relayAtoms = {
  url: atom<string | undefined>(RELAYS[3]),
  status: atom<RelayStatus>("Pending"),
};

// NDK Atom
export const ndkAtom = atom<NDK | null>(null);

// Public key if any
export const pubKeyAtom = atom<string | undefined>(undefined);

// Request Progress
export const progressAtom = atom<ProgressResult>(null);

// Request Type
export const requestTypeAtom = atom<RequestType>(RequestType.CodeReview);
