import { CharacterData } from "./data-models.js";
import { TheFifthTrumpetActorSheet } from "./actor-sheet.js";

Hooks.once("init", () => {
    console.log("The Fifth Trumpet | Initializing");
    Object.assign(CONFIG.Actor.dataModels, { Character: CharacterData });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(
    foundry.documents.Actor,
    "the-fifth-trumpet",
    TheFifthTrumpetActorSheet,
    {
        types: ["Character"],
        makeDefault: true
    }
);
});

Hooks.once("ready", () => {
    console.log("The Fifth Trumpet | Ready");
});