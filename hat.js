/**
 * @class
 * @classdesc Hat used for random draws with weighted entries.
 */
class Hat {
  constructor() {
    /**
     * @type {number}
     * @description The total weight of all entries in the hat.
     */
    this.size = 0;

    /**
     * @type {Array}
     * @property {Array<{id: string, weight: number, cumulativeWeight: number}>}
     * @description The list of entries in the hat, each with an id, weight, and cumulativeWeight.
     */
    this.entries = new Array();

    /**
     * @type {Map}
     * @description A map for quick access to the index of each entry by its id.
     */
    this.index = new Map();
  }

  /**
   * @param {string} id The identifier for the entry.
   * @param {number} weight The weight of the entry, influencing its probability of being drawn.
   * @returns {Hat} Returns the current instance of the Hat.
   * @description Adds a new entry to the hat with the given id and weight.
   */
  set(id, weight) {
    if (this.index.has(id)) {
      return this;
    }

    this.size += weight;
    this.entries.push({id: id, weight: weight, cumulativeWeight: this.size});
    this.index.set(id, this.entries.length - 1);

    // Limit the total size of this Hat instance when adding new entries.
    // Average entry weight should not exceed 4 digits.
    // The objective is to avoid overflow.
    /** @description Temporary variable for downscale behaviour. */
    let tmp = false;
    while (this.size > 9999 * this.entries.length) {
      if (tmp === false) {
        console.info('Hat instance size too large. Downscaling.');
        tmp = true;
      }
      this.scale(1 / 10);
    }

    return this;
  }

  /**
   * @param {string} id The identifier of the entry to remove.
   * @returns {Hat} Returns the current instance of the Hat.
   * @description Removes an entry with the given id from the hat.
   */
  delete(id) {
    if (!this.index.has(id)) {
      return this;
    }
    if (this.entries.length === 1) {
      this.size = 0;
      this.entries.length = 0;
      this.index.clear();
      return this;
    }

    const idIndex = this.index.get(id);
    this.entries.splice(idIndex, 1);

    // Rebuild index, entries (cumulativeWeight), and size
    let cumulativeWeight = 0;
    for (let i = 0; i < this.entries.length; i++) {
      cumulativeWeight += this.entries[i].weight;
      this.entries[i].cumulativeWeight = cumulativeWeight;

      if (i >= idIndex) {
        this.index.set(this.entries[i].id, i);
      }
    }
    this.size = cumulativeWeight;
    this.index.delete(id);

    return this;
  }

  /**
   * @returns {string|undefined} The id of the drawn entry or undefined if the hat is empty.
   * @description Draws a random entry from the hat based on the weights of the entries.
   */
  draw() {
    if (this.size === 0) {
      console.warn('Cannot draw from a Hat instance of size zero.');
      return undefined;
    }
    if (this.size === 1) {
      return this.entries[0].id;
    }

    const random = Math.random() * this.size;

    let left = 0;
    let right = this.entries.length - 1;
    let mid;
    while (left < right) {
      mid = Math.floor((left + right) / 2);
      if (this.entries[mid].cumulativeWeight < random) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    const id = this.entries[left].id;

    const ceilMeanWeight = Math.ceil(this.size / this.entries.length);

    this.size += (this.entries.length - 1) * ceilMeanWeight;
    for (let i = 0; i < this.entries.length; i++) {
      if (i !== left) {
        this.entries[i].weight += ceilMeanWeight;
      }
      this.entries[i].cumulativeWeight += (i < left ? i + 1 : i) * ceilMeanWeight;
    }

    return id;
  }

  /**
   * @param {number} factor The factor by which to scale the weights.
   * @returns {Hat} Returns the current instance of the Hat.
   */
  scale(factor) {
    let cumulativeWeight = 0;
    this.entries = this.entries.map(entry => {
      const scaledWeight = Math.round(entry.weight * factor);
      cumulativeWeight += scaledWeight;
      return {id: entry.id, weight: scaledWeight, cumulativeWeight: cumulativeWeight};
    });
    this.size = cumulativeWeight;

    return this;
  }
}
