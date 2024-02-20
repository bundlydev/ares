import { useContext } from "react";

import { HttpClient } from "@bundly/ic-http-client";

import { IcpConnectContext } from "../context";

export const useRestActor = <T, K extends keyof T = keyof T>(name: K): HttpClient => {
    const { client } = useContext(IcpConnectContext);

    const actor = client.getRestActor(name as string);

    if (!actor) throw new Error("This actor doesn't exist");

    return actor;
};
