import { createFileRoute } from "@tanstack/react-router";
import { AshCircuit } from "@/game/AshCircuit";

export const Route = createFileRoute("/")({ component: AshCircuit });
