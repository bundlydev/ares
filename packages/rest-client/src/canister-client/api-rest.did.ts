export const idlFactory = ({ IDL }: { IDL: any }) => {
    return IDL.Service({
        'http_request': IDL.Func(
            [
                IDL.Record({
                    'url': IDL.Text,
                    'method': IDL.Text,
                    'body': IDL.Vec(IDL.Nat8),
                    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
                    'certificate_version': IDL.Opt(IDL.Nat16),
                }),
            ],
            [
                IDL.Record({
                    'body': IDL.Vec(IDL.Nat8),
                    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
                    'upgrade': IDL.Opt(IDL.Bool),
                    'streaming_strategy': IDL.Opt(
                        IDL.Variant({
                            'Callback': IDL.Record({
                                'token': IDL.Record({}),
                                'callback': IDL.Func(
                                    [IDL.Record({})],
                                    [
                                        IDL.Opt(
                                            IDL.Record({
                                                'token': IDL.Opt(IDL.Record({})),
                                                'body': IDL.Vec(IDL.Nat8),
                                            })
                                        ),
                                    ],
                                    ['query'],
                                ),
                            }),
                        })
                    ),
                    'status_code': IDL.Nat16,
                }),
            ],
            ['query'],
        ),
        'http_request_update': IDL.Func(
            [
                IDL.Record({
                    'url': IDL.Text,
                    'method': IDL.Text,
                    'body': IDL.Vec(IDL.Nat8),
                    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
                    'certificate_version': IDL.Opt(IDL.Nat16),
                }),
            ],
            [
                IDL.Record({
                    'body': IDL.Vec(IDL.Nat8),
                    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
                    'upgrade': IDL.Opt(IDL.Bool),
                    'streaming_strategy': IDL.Opt(
                        IDL.Variant({
                            'Callback': IDL.Record({
                                'token': IDL.Record({}),
                                'callback': IDL.Func(
                                    [IDL.Record({})],
                                    [
                                        IDL.Opt(
                                            IDL.Record({
                                                'token': IDL.Opt(IDL.Record({})),
                                                'body': IDL.Vec(IDL.Nat8),
                                            })
                                        ),
                                    ],
                                    ['query'],
                                ),
                            }),
                        })
                    ),
                    'status_code': IDL.Nat16,
                }),
            ],
            [],
        ),
    });
};