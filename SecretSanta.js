/**
 * Manages a Secret Santa game with weighted participant entries.
 * @class
 * @see SecretSantaParticipant
 */
class SecretSanta {
  constructor(state) {
    /**
     * List of participant names in this Secret Santa game.
     * @type {string[]}
     */
    this.names = [];

    /**
     * Map of participant names to their corresponding SecretSantaParticipant instances.
     * @type {Map}
     */
    this.participants = new Map();

    /**
     * State for this Secret Santa game.
     * @type {Array<{{name: string, stats: {meanRecipientWeight: number, previousRecipient: string, recipientRepeatFrequency: number, recipients: {name: string, weight: number, frequency: number}[]}}}>}
     */
    this.state = state;
  }

  /**
   * @param {any} name The name of participant to be checked.
   * @returns {boolean} True if the participant exists, otherwise false.
   */
  has(name) {
    return this.participants.has(name);
  }

  /**
   * Adds a participant to the Secret Santa game.
   * @param {string} name The name of participant to add.
   * @returns {SecretSanta} The current instance of SecretSanta.
   * @throws {Error} If a participant with the given name already exists.
   */
  addParticipant(name) {
    if (this.has(name)) throw new Error(`Cannot add participant. Name "${name}" already exists.`);

    const {stats = {}} = this.state.find(participant => participant.name === name) || {};
    const participant = new SecretSantaParticipant(name, stats);
    for (let n of this.names) {
      this.participants.get(n).addRecipient(name);
      participant.addRecipient(n);
    }

    this.names.push(name);
    this.participants.set(name, participant);

    return this;
  }

  /**
   * Removes a participant from the Secret Santa game.
   * @param {string} name - The name of the participant to remove.
   * @returns {SecretSanta} The current instance of SecretSanta.
   * @throws {Error} If the participant with the given name does not exist.
   */
  removeParticipant(name) {
    if (!this.has(name)) throw new Error(`Cannot remove participant. Name "${name}" does not exist.`);

    this.participants.delete(name);
    this.names = this.names.filter(n => n !== name);

    for (let n of this.names) this.participants.get(n).removeRecipient(name);

    return this;
  }

  /** Clears all participants from the Secret Santa game.
   * @returns {SecretSanta} The current instance of SecretSanta.
   */
  clear() {
    this.participants.clear();
    this.names = [];

    return this;
  }

  /**
   * Draws and assigns unique recipients to each participant.
   * @returns {Array<{name: string, recipient: string}>} List of participant-recipient pairs.
   */
  draw() {
    const pairs = new Array(this.names.length);

    const shuffledNames = this.names.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledNames.length; i++) {
      const name = shuffledNames[i];
      const participant = this.participants.get(name);
      let recipientName;
      if (
        i === shuffledNames.length - 2 &&
        !pairs.some(pair => pair.recipient === shuffledNames[shuffledNames.length - 1])
      )
        recipientName = shuffledNames[shuffledNames.length - 1];
      else recipientName = participant.hat.draw();

      for (let j = i + 1; j < shuffledNames.length; j++) {
        const name = shuffledNames[j];
        if (name !== recipientName) this.participants.get(name).removeRecipient(recipientName);
      }

      pairs[i] = {name: name, recipient: recipientName};

      participant.choose(recipientName);
    }

    this.updateState(this.names.map(name => this.participants.get(name).toJSON()));

    return pairs;
  }

  /**
   * Updates the internal state of the Secret Santa game with the provided state.
   * @param {Array<{name: string, stats: {meanRecipientWeight: number, previousRecipient: string, recipientRepeatFrequency: number, recipients: Array<{name: string, weight: number, frequency: number}>}}>} state The new state to be merged with the current state.
   * @returns {SecretSanta} The current instance of SecretSanta.
   */
  updateState(state) {
    const map = new Map();

    for (let participant of this.state) map.set(participant.name, participant);
    for (let participant of state) map.set(participant.name, participant);

    this.state = Array.from(map.values());

    return this;
  }

  /**
   * Sets a new state for the Secret Santa game.
   * @param {Array<{name: string, stats: {meanRecipientWeight: number, previousRecipient: string, recipientRepeatFrequency: number, recipients: Array<{name: string, weight: number, frequency: number}>}}>} state The new state to set for the game.
   * @returns {SecretSanta} The current instance of SecretSanta.
   */
  setState(state) {
    const tmp = this.names;

    this.clear();

    this.state = state;

    for (let name of tmp) this.addParticipant(name);

    return this;
  }

  /**
   * Serializes the current state of the Secret Santa game to a JSON-compatible format.
   * @returns {Array<{name: string, stats: {meanRecipientWeight: number, previousRecipient: string, recipientRepeatFrequency: number, recipients: Array<{name: string, weight: number, frequency: number}>}}>} JSON representation of the current state.
   */
  toJSON() {
    return this.state;
  }
}
