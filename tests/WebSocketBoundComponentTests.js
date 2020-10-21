/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus-client/main/LICENSE.txt
*/

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

require("../index.js");
// TODO: Is using NexusTestUtils.js reasonable?
fluid.require("%infusion-nexus/src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("fluid.tests.nexusClient.webSocketBoundComponent.managePeerAndSendUpdates");
fluid.registerNamespace("fluid.tests.nexusClient.webSocketBoundComponent.managePeerAndReceiveUpdates");
fluid.registerNamespace("fluid.tests.nexusClient.webSocketBoundComponent.noManagePeerAndSendUpdates");
fluid.registerNamespace("fluid.tests.nexusClient.webSocketBoundComponent.noManagePeerAndReceiveUpdates");

// Base testCaseHolder

fluid.defaults("fluid.tests.nexusClient.webSocketBoundComponent.testCaseHolder", {
    gradeNames: ["fluid.test.nexus.testCaseHolder"],
    testComponentPath: "nexusWebSocketBoundComponentPeer",
    clientManagesPeer: false,
    clientSendsChangesToNexus: false,
    clientReceivesChangesFromNexus: false,
    events: {
        createClient: null
    },
    components: {
        client: {
            type: "fluid.nexusWebSocketBoundComponent",
            createOnEvent: "{tests}.events.createClient",
            options: {
                members: {
                    nexusHost: "localhost",
                    nexusPort: "{configuration}.options.serverPort",
                    nexusPeerComponentPath: "{tests}.options.testComponentPath",
                    nexusPeerComponentOptions: {
                        type: "fluid.modelComponent",
                        model: {
                            valueA: "hello"
                        }
                    },
                    nexusBoundModelPath: "valueA",
                    managesPeer: "{tests}.options.clientManagesPeer",
                    sendsChangesToNexus: "{tests}.options.clientSendsChangesToNexus",
                    receivesChangesFromNexus: "{tests}.options.clientReceivesChangesFromNexus"
                },
                model: {
                    valueA: "hello"
                }
            }
        }
    }
});

// Tests

fluid.tests.nexusClient.webSocketBoundComponent.managePeerAndSendUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent manage peer and send updates tests",
        gradeNames: "fluid.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 6,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        clientManagesPeer: true,
        clientSendsChangesToNexus: true,
        clientReceivesChangesFromNexus: false,
        sequence: [
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Peer not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that fluid.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Change the model value in the client
            {
                func: "{client}.applier.change(valueA, updated)"
            },
            // Verify that the peer in the Nexus is updated
            {
                changeEvent: "{fluid.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Peer model has been updated",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "updated"
                    }
                ]
            },
            // Destroy the Nexus peer via the client
            {
                func: "{client}.destroyNexusPeerComponent"
            },
            {
                event: "{fluid.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.events.onDestroy",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            },
            {
                event: "{client}.events.onPeerDestroyed",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            }
        ]
    }
];

fluid.tests.nexusClient.webSocketBoundComponent.managePeerAndReceiveUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent manage peer and receive updates tests",
        gradeNames: "fluid.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 5,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        clientManagesPeer: true,
        clientSendsChangesToNexus: false,
        clientReceivesChangesFromNexus: true,
        sequence: [
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Peer not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that fluid.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Change the model value in the Nexus peer
            {
                func: "{fluid.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.change(valueA, updated)"
            },
            // Verify that the client is updated
            {
                changeEvent: "{client}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "Client model has been updated",
                    {
                        valueA: "updated"
                    },
                    "{client}.model"
                ]
            },
            // Destroy the Nexus peer via the client
            {
                func: "{client}.destroyNexusPeerComponent"
            },
            {
                event: "{fluid.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.events.onDestroy",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            },
            {
                event: "{client}.events.onPeerDestroyed",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            }
        ]
    }
];

fluid.tests.nexusClient.webSocketBoundComponent.noManagePeerAndSendUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent do not manage peer and send updates tests",
        gradeNames: "fluid.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 6,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        clientManagesPeer: false,
        clientSendsChangesToNexus: true,
        clientReceivesChangesFromNexus: false,
        sequence: [
            // Construct peer
            {
                task: "fluid.constructNexusPeer",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testComponentPath",
                    {
                        type: "fluid.modelComponent",
                        model: {
                            valueA: "constructed before client"
                        }
                    }
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Nexus peer constructed"]
            },
            // Construct client
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that fluid.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Check that construction of the client didn't alter the peer
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Peer model is unchanged",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "constructed before client"
                    }
                ]
            },
            // Change the model value in the client
            {
                func: "{client}.applier.change(valueA, updated)"
            },
            // Verify that the peer in the Nexus is updated
            {
                changeEvent: "{fluid.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Peer model has been updated",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "updated"
                    }
                ]
            }
        ]
    }
];

fluid.tests.nexusClient.webSocketBoundComponent.noManagePeerAndReceiveUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent do not manage peer and receive updates tests",
        gradeNames: "fluid.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 6,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        clientManagesPeer: false,
        clientSendsChangesToNexus: false,
        clientReceivesChangesFromNexus: true,
        sequence: [
            // Construct peer
            {
                task: "fluid.constructNexusPeer",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testComponentPath",
                    {
                        type: "fluid.modelComponent",
                        model: {
                            valueA: "constructed before client"
                        }
                    }
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Nexus peer constructed"]
            },
            // Construct client
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that fluid.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Check that construction of the client didn't alter the peer
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Peer model is unchanged",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "constructed before client"
                    }
                ]
            },
            // We will get a message with the initial peer model value
            {
                changeEvent: "{client}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "Client model has been set to the initial peer model value",
                    {
                        valueA: "constructed before client"
                    },
                    "{client}.model"
                ]
            },
            // Change the model value in the Nexus peer
            {
                func: "{fluid.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.change(valueA, updated)"
            },
            // Verify that the client is updated
            {
                changeEvent: "{client}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "Client model has been updated",
                    {
                        valueA: "updated"
                    },
                    "{client}.model"
                ]
            }
        ]
    }
];

// Test error cases with no Nexus running

fluid.defaults("fluid.tests.nexusClient.webSocketBoundComponent.noNexusTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    serverHost: "localhost",
    serverPort: 8082,
    events: {
        createClient: null
    },
    components: {
        client: {
            type: "fluid.nexusWebSocketBoundComponent",
            createOnEvent: "{testEnvironment}.events.createClient",
            options: {
                members: {
                    nexusHost: "{testEnvironment}.options.serverHost",
                    nexusPort: "{testEnvironment}.options.serverPort",
                    nexusPeerComponentPath: "someComponentPath",
                    managesPeer: true,
                    nexusPeerComponentOptions: {
                        type: "fluid.component"
                    }
                }
            }
        },
        noNexusTester: {
            type: "fluid.tests.nexusClient.webSocketBoundComponent.noNexusTester"
        }
    }
});

fluid.defaults("fluid.tests.nexusClient.webSocketBoundComponent.noNexusTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "nexusWebSocketBoundComponent No Nexus tests",
        tests: [
            {
                name: "Expect error constructing peer",
                expect: 1,
                sequence: [
                    {
                        func: "{testEnvironment}.events.createClient.fire"
                    },
                    {
                        event: "{testEnvironment fluid.nexusWebSocketBoundComponent}.events.onErrorConstructingPeer",
                        listener: "jqUnit.assert",
                        args: ["Error constructing peer"]
                    }
                ]
            }
        ]
    }]
});

kettle.test.bootstrapServer(fluid.tests.nexusClient.webSocketBoundComponent.managePeerAndSendUpdates.testDefs);
kettle.test.bootstrapServer(fluid.tests.nexusClient.webSocketBoundComponent.managePeerAndReceiveUpdates.testDefs);
kettle.test.bootstrapServer(fluid.tests.nexusClient.webSocketBoundComponent.noManagePeerAndSendUpdates.testDefs);
kettle.test.bootstrapServer(fluid.tests.nexusClient.webSocketBoundComponent.noManagePeerAndReceiveUpdates.testDefs);
fluid.test.runTests(["fluid.tests.nexusClient.webSocketBoundComponent.noNexusTestTree"]);
