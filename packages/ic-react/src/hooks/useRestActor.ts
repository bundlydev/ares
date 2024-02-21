import { useContext } from "react";

import { HttpClient } from "@bundly/ic-http-client";

import { IcpConnectContext } from "../context";

export const useRestActor = (name: string): HttpClient => {
    const { client } = useContext(IcpConnectContext);

    const actor = client.getRestActor(name);

    if (!actor) throw new Error("This actor doesn't exist");

    return actor;
};
