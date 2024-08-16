/**
 * @class
 * @classdesc Secret Santa used for random group draws with weighted entries. Wrapper for class Hat.
 * @see class Hat
 * @see function validateJson
 */
class SecretSanta {
  constructor(state) {
    const stateSchema = {
      people: [
        {
          name: 'string',
          recipients: [{name: 'string', weight: 'number', frequency: 'number'}],
          stats: {recipientRepeatFrequency: 'number', previousRecipient: 'string'},
        },
      ],
    };
    validateJson(state, stateSchema);

    /**
     * @type {Array}
     * @property {Array<{string}>}
     * @description The list of entered names in Secret Santa.
     */
    this.names = state.people.map(person => person.name);

    /**
     * @type {Map}
     * @description A map from names to person state (name, recipients, stats).
     */
    this.people = new Map();

    /**
     * @type {Map}
     * @description A map from names to person state (name, recipients, stats).
     */
    this.nameToHat = new Map();

    for (let i of state.people) {
      this.people.set(i.name, i);
      this.nameToHat.set(i.name, new Hat());
      for (let j of i.recipients) {
        this.nameToHat.get(i.name).set(j.name, j.weight);
      }
    }

    /**
     * @type {JSON}
     * @description The original and referenced (pass-by-reference) state.
     */
    this.state = state;
  }

  /**
   * @returns {Array<{name: string, recipient: string}>} List of names and their unique chosen recipient.
   * @description Draws a unique recipient for each name.
   */
  draw() {
    let pairs = new Array(this.names.length);

    const shuffledNames = this.names.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledNames.length; i++) {
      const name = shuffledNames[i];
      let recipientName;
      if (
        i === shuffledNames.length - 2 &&
        !pairs.some(pair => pair.recipient === shuffledNames[shuffledNames.length - 1])
      ) {
        // Force break the ring
        recipientName = shuffledNames[shuffledNames.length - 1];
      } else {
        // Normal case
        recipientName = this.nameToHat.get(name).draw();
      }

      for (let j = i + 1; j < shuffledNames.length; j++) {
        this.nameToHat.get(shuffledNames[j]).delete(recipientName);
      }

      pairs[i] = {name: name, recipient: recipientName};

      if (this.people.get(name).stats.previousRecipient === recipientName) {
        this.people.get(name).stats.recipientRepeatFrequency++;
      }
      this.people.get(name).stats.previousRecipient = recipientName;
      this.people.get(name).recipients.map(recipient => {
        if (recipient.name === recipientName) {
          recipient.frequency++;
        }
        return recipient;
      });

      const meanWeight =
        this.people.get(name).recipients.reduce((acc, recipient) => acc + recipient.weight, 0) /
        this.people.get(name).recipients.length;
      this.people.get(name).recipients.map(recipient => {
        if (recipient.name !== recipientName) {
          recipient.weight += Math.ceil(meanWeight);
        }
        return recipient;
      });

      while (this.people.get(name).recipients.some(recipient => recipient.weight > 9999)) {
        this.people.get(name).recipients.map(recipient => {
          recipient.weight = Math.round(recipient.weight / 10);
          return recipient;
        });
      }
    }

    return pairs;
  }

  toJSON() {
    return this.state;
  }
}
