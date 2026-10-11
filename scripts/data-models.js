const { NumberField, SchemaField } = foundry.data.fields;

export class CharacterData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const dicePool = () => new NumberField({required: true, integer: true, min: 0, initial: 0});
        const damageTrack = () => new SchemaField({
            max: new NumberField({required: true, integer: true, min: 0, initial: 5}),
            superficial: new NumberField({required: true, integer: true, min: 0, initial: 0}),
            aggravated: new NumberField({required: true, integer: true, min: 0, initial: 0})
        });
        return {
            health: damageTrack(),
            sanity: damageTrack(),
            attributes: new SchemaField({
                fortitude: new SchemaField({
                    physique: dicePool(),
                    endurance: dicePool()
                }),
                prudence: new SchemaField({
                    understanding: dicePool(),
                    calmness: dicePool()
                }),
                temperance: new SchemaField({
                    intuition: dicePool(),
                    presence: dicePool(),
                    conviction: dicePool()
                }),
                justice: new SchemaField({
                    reflex: dicePool(),
                    focus: dicePool()
                })
            }),
            skills: new SchemaField({
                athletics: dicePool(),
                crafting: dicePool(),
                drive: dicePool(),
                larceny: dicePool(),
                stealth: dicePool(),
                survival: dicePool(),
                animalKen: dicePool(),
                insight: dicePool(),
                intimidation: dicePool(),
                leadership: dicePool(),
                performance: dicePool(),
                persuasion: dicePool(),
                subterfuge: dicePool(),
                backstreetsSociety: dicePool(),
                highSociety: dicePool(),
                awareness: dicePool(),
                investigation: dicePool(),
                citySecrets: dicePool(),
                medicine: dicePool(),
                technology: dicePool(),
                brawl: dicePool(),
                firearms: dicePool(),
                melee: dicePool()
            })
        };
    }
}