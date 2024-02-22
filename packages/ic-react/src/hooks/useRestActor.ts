import { useContext } from "react";

import { AresInstance } from "@bundly/ares";

import { IcpConnectContext } from "../context";

export const useRestActor = (name: string): AresInstance => {
    const { client } = useContext(IcpConnectContext);

    const actor = client.getRestActor(name);

    if (!actor) throw new Error("This actor doesn't exist");

    return actor;
};
