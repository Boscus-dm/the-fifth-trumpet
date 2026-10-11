const { api, sheets } = foundry.applications;

function damageValues(track) {
    const max = Math.max(0, Math.trunc(Number(track.max) || 0));
    const aggravated = Math.min(max, Math.max(0, Math.trunc(Number(track.aggravated) || 0)));
    const superficial = Math.min(max - aggravated, Math.max(0, Math.trunc(Number(track.superficial) || 0)));
    return {max, aggravated, superficial};
}

function prepareDamageTrack(key, label, track) {
    const {max, aggravated, superficial} = damageValues(track);
    return {
        key, label, max, aggravated, superficial,
        boxes: Array.from({length: max}, (_, index) => {
            const state = index < aggravated ? "aggravated" : index < aggravated + superficial ? "superficial" : "empty";
            return {index, number: index + 1, state, marker: state === "aggravated" ? "X" : state === "superficial" ? "/" : "", trackLabel: label};
        })
    };
}

function highestValue(values) {
    return Math.max(0, ...values.map(value => Number(value) || 0));
}

export class TheFifthTrumpetActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["the-fifth-trumpet", "actor-sheet"],
        tag: "form",
        position: {width: 800, height: 850},
        form: {submitOnChange: true, closeOnSubmit: false},
        actions: {
            "damage-box": this._onDamageBoxClick,
            "damage-adjust": this._onDamageAdjustClick
        }
    };

    static PARTS = {
        main: {
            template: "systems/the-fifth-trumpet/templates/actor-sheet.html",
            scrollable: [""]
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.actor = this.actor;
        context.system = this.actor.system;
        const s = this.actor.system;

        context.damageTracks = [
            prepareDamageTrack("health", "Health", s.health),
            prepareDamageTrack("sanity", "Sanity", s.sanity)
        ];

        context.attributeCategories = [
            {
                label: "Fortitude",
                highestValue: highestValue([s.attributes.fortitude.physique, s.attributes.fortitude.endurance]),
                attributes: [
                    {label: "Physique", path: "system.attributes.fortitude.physique", value: s.attributes.fortitude.physique},
                    {label: "Endurance", path: "system.attributes.fortitude.endurance", value: s.attributes.fortitude.endurance}
                ]
            },
            {
                label: "Prudence",
                highestValue: highestValue([s.attributes.prudence.understanding, s.attributes.prudence.calmness]),
                attributes: [
                    {label: "Understanding", path: "system.attributes.prudence.understanding", value: s.attributes.prudence.understanding},
                    {label: "Calmness", path: "system.attributes.prudence.calmness", value: s.attributes.prudence.calmness}
                ]
            },
            {
                label: "Temperance",
                highestValue: highestValue([s.attributes.temperance.intuition, s.attributes.temperance.presence, s.attributes.temperance.conviction]),
                attributes: [
                    {label: "Intuition", path: "system.attributes.temperance.intuition", value: s.attributes.temperance.intuition},
                    {label: "Presence", path: "system.attributes.temperance.presence", value: s.attributes.temperance.presence},
                    {label: "Conviction", path: "system.attributes.temperance.conviction", value: s.attributes.temperance.conviction}
                ]
            },
            {
                label: "Justice",
                highestValue: highestValue([s.attributes.justice.reflex, s.attributes.justice.focus]),
                attributes: [
                    {label: "Reflex", path: "system.attributes.justice.reflex", value: s.attributes.justice.reflex},
                    {label: "Focus", path: "system.attributes.justice.focus", value: s.attributes.justice.focus}
                ]
            }
        ];

        context.skillGroups = [
            {
                label: "General Skills",
                wide: true,
                skills: [
                    {label: "Athletics", path: "system.skills.athletics", value: s.skills.athletics},
                    {label: "Crafting", path: "system.skills.crafting", value: s.skills.crafting},
                    {label: "Drive", path: "system.skills.drive", value: s.skills.drive},
                    {label: "Larceny", path: "system.skills.larceny", value: s.skills.larceny},
                    {label: "Stealth", path: "system.skills.stealth", value: s.skills.stealth},
                    {label: "Survival", path: "system.skills.survival", value: s.skills.survival},
                    {label: "Animal Ken", path: "system.skills.animalKen", value: s.skills.animalKen},
                    {label: "Insight", path: "system.skills.insight", value: s.skills.insight},
                    {label: "Intimidation", path: "system.skills.intimidation", value: s.skills.intimidation},
                    {label: "Leadership", path: "system.skills.leadership", value: s.skills.leadership},
                    {label: "Performance", path: "system.skills.performance", value: s.skills.performance},
                    {label: "Persuasion", path: "system.skills.persuasion", value: s.skills.persuasion},
                    {label: "Subterfuge", path: "system.skills.subterfuge", value: s.skills.subterfuge},
                    {label: "Backstreets Society", path: "system.skills.backstreetsSociety", value: s.skills.backstreetsSociety},
                    {label: "High Society", path: "system.skills.highSociety", value: s.skills.highSociety},
                    {label: "Awareness", path: "system.skills.awareness", value: s.skills.awareness},
                    {label: "Investigation", path: "system.skills.investigation", value: s.skills.investigation},
                    {label: "City Secrets", path: "system.skills.citySecrets", value: s.skills.citySecrets},
                    {label: "Medicine", path: "system.skills.medicine", value: s.skills.medicine},
                    {label: "Technology", path: "system.skills.technology", value: s.skills.technology}
                ]
            },
            {
                label: "Combat-Related Skills",
                wide: false,
                skills: [
                    {label: "Brawl", path: "system.skills.brawl", value: s.skills.brawl},
                    {label: "Firearms", path: "system.skills.firearms", value: s.skills.firearms},
                    {label: "Melee", path: "system.skills.melee", value: s.skills.melee}
                ]
            }
        ];
        return context;
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const box of this.element.querySelectorAll('[data-action="damage-box"]')) {
            box.addEventListener("contextmenu", event => this._onDamageBoxRightClick(event, box));
        }
    }

    static async _onDamageBoxClick(event, target) {
        event.preventDefault();
        const key = target.dataset.track;
        const index = Number(target.dataset.index);
        if (!["health", "sanity"].includes(key) || !Number.isInteger(index)) return;

        const track = this.actor.system[key];
        const {max, aggravated, superficial} = damageValues(track);
        if (index < 0 || index >= max || index < aggravated) return;

        if (index < aggravated + superficial) {
            await this.actor.update({
                [`system.${key}.aggravated`]: aggravated + 1,
                [`system.${key}.superficial`]: superficial - 1
            });
        } else {
            await this.actor.update({
                [`system.${key}.superficial`]: index + 1 - aggravated
            });
        }
    }

    async _onDamageBoxRightClick(event, target) {
        event.preventDefault();
        const key = target.dataset.track;
        const index = Number(target.dataset.index);
        if (!["health", "sanity"].includes(key) || !Number.isInteger(index)) return;

        const {max, aggravated, superficial} = damageValues(this.actor.system[key]);
        if (index < 0 || index >= max) return;

        if (index < aggravated) {
            await this.actor.update({
                [`system.${key}.aggravated`]: aggravated - 1,
                [`system.${key}.superficial`]: superficial + 1
            });
        } else if (index < aggravated + superficial) {
            await this.actor.update({
                [`system.${key}.superficial`]: superficial - 1
            });
        }
    }

    static async _onDamageAdjustClick(event, target) {
        event.preventDefault();
        const key = target.dataset.track;
        if (!["health", "sanity"].includes(key)) return;

        const {max, aggravated, superficial} = damageValues(this.actor.system[key]);
        const adjustment = target.dataset.adjust === "increase" ? 1 : target.dataset.adjust === "decrease" ? -1 : 0;
        if (!adjustment) return;

        const nextMax = Math.max(0, max + adjustment);
        let nextAggravated = aggravated;
        let nextSuperficial = superficial;

        if (nextAggravated + nextSuperficial > nextMax) {
            if (nextSuperficial > 0) nextSuperficial--;
            else nextAggravated--;
        }

        await this.actor.update({
            [`system.${key}.max`]: nextMax,
            [`system.${key}.aggravated`]: nextAggravated,
            [`system.${key}.superficial`]: nextSuperficial
        });
    }
}