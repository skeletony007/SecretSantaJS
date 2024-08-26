/**
 * Represents a participant in the Secret Santa game.
 * @class
 * @see SecretSanta
 * @see validateJson
 */
class SecretSantaParticipant {
  /**
   * Creates a new SecretSantaParticipant.
   * @param {string} name - The name of the participant.
   * @param {Object} [stats={}] - Optional participant statistics.
   */
  constructor(name, stats = {}) {
    const statsSchema = {
      meanRecipientWeight: 'number',
      previousRecipient: 'string',
      recipientRepeatFrequency: 'number',
      recipients: [{name: 'string', weight: 'number', frequency: 'number'}],
    };
    validateJson(stats, statsSchema);

    /**
     * Participant's name.
     * @type {string}
     */
    this.name = name;

    /**
     * Participant's statistics.
     * @type {Object}
     */
    this.stats = {
      ...{
        meanRecipientWeight: 1,
        previousRecipient: '',
        recipientRepeatFrequency: 0,
        recipients: [],
      },
      ...stats,
    };

    /**
     * Instance of Hat used for managing recipient drawing.
     * @type {Hat}
     */
    this.hat = new Hat();
  }

  /**
   * Adds a recipient to the participant's Hat draw.
   * @param {string} name - Name of the recipient to add.
   * @returns {SecretSantaParticipant} The current instance of SecretSantaParticipant.
   */
  addRecipient(name) {
    const {weight = this.stats.meanRecipientWeight, frequency = 0} =
      this.stats.recipients.find(recipient => recipient.name === name) || {};

    const map = new Map();
    for (let recipient of this.stats.recipients) {
      map.set(recipient.name, recipient);
    }
    map.set(name, {name: name, weight: weight, frequency: frequency});
    this.stats.recipients = Array.from(map.values());

    this.hat.set(name, weight);

    this.recalculateMeanRecipientWeight();

    return this;
  }

  /**
   * Removes a recipient from the participant's Hat draw.
   * @param {string} name - Name of the recipient to remove.
   * @returns {SecretSantaParticipant} The current instance of SecretSantaParticipant.
   */
  removeRecipient(name) {
    this.hat.delete(name);

    return this;
  }

  /**
   * Updates the participant's stats after choosing a recipient in a Secret Santa game.
   * @param {string} name - Name of the chosen recipient.
   * @returns {SecretSantaParticipant} The current instance of SecretSantaParticipant.
   */
  choose(name) {
    if (this.stats.previousRecipient === name) {
      this.stats.recipientRepeatFrequency++;
    }
    this.stats.previousRecipient = name;

    this.stats.recipients = this.stats.recipients.map(recipient => {
      if (recipient.name === name) {
        recipient.frequency++;
      } else {
        recipient.weight += this.stats.meanRecipientWeight;
      }
      return recipient;
    });

    this.normalizeWeights();

    this.recalculateMeanRecipientWeight();

    return this;
  }

  /**
   * Recalculates the mean weight of recipients based on current stats.
   * @returns {SecretSantaParticipant} The current instance of SecretSantaParticipant.
   */
  recalculateMeanRecipientWeight() {
    this.stats.meanRecipientWeight = Math.round(
      this.stats.recipients.reduce((acc, recipient) => acc + recipient.weight, 0) / this.stats.recipients.length
    );
  }

  /**
   * Normalizes recipient weights to avoid excessive decimal places.
   * @returns {SecretSantaParticipant} The current instance of SecretSantaParticipant.
   */
  normalizeWeights() {
    while (this.stats.recipients.some(recipient => recipient.weight > 9999)) {
      this.stats.recipients = this.stats.recipients.map(recipient => {
        recipient.weight = Math.ceil(recipient.weight / 10);
        return recipient;
      });
    }

    return this;
  }

  /**
   * Serializes the participant to a JSON object.
   * @returns {{name: string, stats: {meanRecipientWeight: number, previousRecipient: string, recipientRepeatFrequency: number, recipients: {name: string, weight: number, frequency: number}[]}}} JSON representation of the participant, including their name and statistics.
   */
  toJSON() {
    return {name: this.name, stats: this.stats};
  }
}
