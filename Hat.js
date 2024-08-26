/**
 * Hat used for random draws with weighted elements.
 * @class
 */
class Hat {
  constructor() {
    /**
     * Total cumulative weight for all elements in this hat.
     * @type {number}
     */
    this.size = 0;

    /**
     * List of elements in this hat.
     * @type {Array<{id: string, weight: number, cumulativeWeight: number}>}
     */
    this.elements = [];

    /**
     * Map from element id to element index.
     * @type {Map<string, number>}
     * @see Hat#elements
     */
    this.index = new Map();
  }

  /**
   * Checks whether an element exists in this hat.
   * @param {string} id Id for the element.
   * @returns {boolean} True if the element exists, otherwise false.
   */
  has(id) {
    return this.index.has(id);
  }

  /**
   * Adds a new element to the hat.
   * @param {string} id The identifier for the element.
   * @param {number} weight The weight of the element, influencing its probability of being drawn.
   * @returns {Hat} The current instance of Hat.
   * @throws {Error} Throws an error if an element with the given id already exists.
   */
  set(id, weight) {
    if (this.has(id)) throw new Error(`Cannot set this id. Id ${id} already exists.`);

    this.size += weight;
    this.elements.push({id: id, weight: weight, cumulativeWeight: this.size});
    this.index.set(id, this.elements.length - 1);

    // Limit the total size of this Hat instance when adding new elements.
    // Average element weight should not exceed 4 digits.
    // The objective is to avoid overflow.
    /** Temporary variable for downscale behaviour. */
    let tmp = false;
    while (this.size > 9999 * this.elements.length) {
      if (tmp === false) {
        tmp = true;
      }
      this.scale(1 / 10);
    }

    return this;
  }

  /**
   * Removes an element from the hat.
   * @param {string} id Id of the element to remove.
   * @returns {Hat} The current instance of Hat.
   * @throws {Error} Throws an error if an element with the given id does not exist.
   */
  delete(id) {
    if (!this.has(id)) throw new Error(`Cannot delete this id. Id ${id} does not exist.`);

    if (this.elements.length === 1) {
      this.size = 0;
      this.elements.length = 0;
      this.index.clear();
      return this;
    }

    const idIndex = this.index.get(id);
    this.elements.splice(idIndex, 1);

    // Rebuild index, elements (cumulativeWeight), and size
    let cumulativeWeight = 0;
    for (let i = 0; i < this.elements.length; i++) {
      cumulativeWeight += this.elements[i].weight;
      this.elements[i].cumulativeWeight = cumulativeWeight;

      if (i >= idIndex) {
        this.index.set(this.elements[i].id, i);
      }
    }
    this.size = cumulativeWeight;
    this.index.delete(id);

    return this;
  }

  /**
   * Draws a random element from the hat.
   * @returns {string} Id of drawn element.
   * @throws {Error} Throws an error if the hat is empty (size zero).
   */
  draw() {
    if (this.size === 0) {
      throw new Error('Cannot draw with size zero.');
    }
    if (this.size === 1) {
      return this.elements[0].id;
    }

    const random = Math.random() * this.size;

    let left = 0;
    let right = this.elements.length - 1;
    let mid;
    while (left < right) {
      mid = Math.floor((left + right) / 2);
      if (this.elements[mid].cumulativeWeight < random) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    const id = this.elements[left].id;

    const ceilMeanWeight = Math.ceil(this.size / this.elements.length);

    this.size += (this.elements.length - 1) * ceilMeanWeight;
    for (let i = 0; i < this.elements.length; i++) {
      if (i !== left) {
        this.elements[i].weight += ceilMeanWeight;
      }
      this.elements[i].cumulativeWeight += (i < left ? i + 1 : i) * ceilMeanWeight;
    }

    return id;
  }

  /**
   * Scales the weights of all elements in the hat.
   * @param {number} factor Factor by which to scale the weights.
   * @returns {Hat} The current instance of Hat.
   */
  scale(factor) {
    let cumulativeWeight = 0;
    this.elements = this.elements.map(element => {
      const scaledWeight = Math.ceil(element.weight * factor);
      cumulativeWeight += scaledWeight;
      return {id: element.id, weight: scaledWeight, cumulativeWeight: cumulativeWeight};
    });
    this.size = cumulativeWeight;

    return this;
  }
}
