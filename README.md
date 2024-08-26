```
                /\
 Q_           <' +`>
  \`-._        ,\/.
   |/'"'       /,*\
    ^~_~      ,/{|>*
    /   \    ,<\ o*'.
    ") )"   .}$)* \>*,
     ` `        ||
```

# JavaScript Secret Santa Pairing System

Simple Secret Santa System that is random in just the right way. 🎄

# Example

```javascript
const secretSanta = new SecretSanta(state);

/**
 * List of participant names in Secret Santa game.
 * @type {string[]}
 */
const names = [];

for (let name of names) secretSanta.addParticipant(name);

const pairs = secretSanta.draw();

state = secretSanta.toJSON();

for (let pair of pairs) console.log(pair);
```

# State

State returned by `SecretSanta.toJSON()` matches [JSON Schema]:

```json
[
  {
    "name": "string",
    "stats": {
      "meanRecipientWeight": "number",
      "previousRecipient": "string",
      "recipientRepeatFrequency": "number",
      "recipients": [
        {
          "name": "string",
          "weight": "number",
          "frequency": "number"
        }
      ]
    }
  }
]
```

> [!TIP]
> Store the state after each draw and use it in subsequent runs.

[JSON Schema]: https://json-schema.org
