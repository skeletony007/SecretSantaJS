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

This project consists of JavaScript classes Hat and
[SecretSanta](#secretsanta-class), which together create Secret Santa pairings.

# Usage

1. Retrieve the output state from the previous year’s event.
2. Pass this state as the input to the `SecretSanta` constructor.
3. Use the `draw()` method to generate a new set of Secret Santa pairs for the
   current year.

## Example

```javascript
const lastYearState = // Retrieve last year's state from storage
const secretSanta = new SecretSanta(lastYearState);

const thisYearPairs = secretSanta.draw();

const thisYearState = secretSanta.toJSON();
// Save thisYearState as initial the state for next year
```

# SecretSanta Class

The `SecretSanta` class is designed to be used with an input state that
reflects the state of the previous year’s Secret Santa event
(`secretSanta.toJSON()`).

## SecretSanta Constructor

```javascript
const secretSanta = new SecretSanta(state);
```

> [!TIP]
> Keys in the input state are accessed without altering other keys, so feel
> free to store other information in state. It will still be there on the other
> side ;)  (`secretSanta.toJSON()`)

[JSON Schema] for input state:

```json
{
  "people": [
    {
      "name": "string",
      "recipients": [
        {
          "name": "string",
          "weight": "number",
          "frequency": "number"
        }
      ],
      "stats": {
        "recipientRepeatFrequency": "number",
        "previousRecipient": "string"
      }
    }
  ]
}
```

Example initial input state JSON:

```json
{
  "people": [
    {
      "name": "John",
      "recipients": [
        {"name": "Paul", "weight": 1, "frequency": 0},
        {"name": "George", "weight": 1, "frequency": 0},
        {"name": "Ringo", "weight": 1, "frequency": 0}
      ],
      "stats": {
        "recipientRepeatFrequency": 0,
        "previousRecipient": ""
      }
    },
    {
      "name": "Paul",
      "recipients": [
        {"name": "John", "weight": 1, "frequency": 0},
        {"name": "George", "weight": 1, "frequency": 0},
        {"name": "Ringo", "weight": 1, "frequency": 0}
      ],
      "stats": {
        "recipientRepeatFrequency": 0,
        "previousRecipient": ""
      }
    },
    {
      "name": "George",
      "recipients": [
        {"name": "John", "weight": 1, "frequency": 0},
        {"name": "Paul", "weight": 1, "frequency": 0},
        {"name": "Ringo", "weight": 1, "frequency": 0}
      ],
      "stats": {
        "recipientRepeatFrequency": 0,
        "previousRecipient": ""
      }
    },
    {
      "name": "Ringo",
      "recipients": [
        {"name": "John", "weight": 1, "frequency": 0},
        {"name": "Paul", "weight": 1, "frequency": 0},
        {"name": "George", "weight": 1, "frequency": 0}
      ],
      "stats": {
        "recipientRepeatFrequency": 0,
        "previousRecipient": ""
      }
    }
  ]
}
```

# Explanation

Each time `secretSanta.draw()` is executed, the Secret Santa process unfolds as
follows:

1. **Participant Queue Formation:** 
   - The participants (`state.people`) are shuffled into a random order,
     creating a queue for recipient assignment.
2. **Hat Initialization:** 
   - Each participant is assigned a "hat" containing all potential recipients
     (`state.people[i].recipients`). The likelihood of selecting each recipient
     is based on their corresponding weight using `recipient.weight`.
3. **Recipient Assignment:**
   - Participants are processed sequentially from the queue. Each participant
     draws a recipient from their "hat".
   - The drawn recipient is then removed using `hat.delete()` from the "hats"
     of all remaining participants to ensure uniqueness.
   - For all recipients not chosen, their weights are increased by the mean
     recipient weight for the current participant, promoting diversity in
     future draws.

[JSON Schema]: https://json-schema.org
