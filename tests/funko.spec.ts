import "mocha";
import { assert } from "chai";
import { FunkoType, FunkoGenre, Funko } from "../src/Funko.js";

describe("Funko", () => {
  const data = {
    id: "1",
    name: "Harry Potter",
    description: "A wizard with a lightning bolt scar on his forehead",
    type: FunkoType.POP,
    genre: FunkoGenre.FILMS_AND_TV,
    franchise: "Harry Potter",
    franchiseNumber: 1,
    isExclusive: false,
    specialFeatures: "None",
    marketValue: 10.0,
  };

  it("should create a new Funko object", () => {
    const funko = new Funko(
      data.id,
      data.name,
      data.description,
      data.type,
      data.genre,
      data.franchise,
      data.franchiseNumber,
      data.isExclusive,
      data.specialFeatures,
      data.marketValue
    );

    assert.instanceOf(funko, Funko);
  });

  it("should throw an error for invalid franchise number", () => {
    assert.throws(
      () => {
        new Funko(
          data.id,
          data.name,
          data.description,
          data.type,
          data.genre,
          data.franchise,
          -1,
          data.isExclusive,
          data.specialFeatures,
          data.marketValue
        );
      },
      Error,
      "Invalid Franchise Number: -1"
    );
  });

  it("should throw an error for invalid market value", () => {
    assert.throws(
      () => {
        new Funko(
          data.id,
          data.name,
          data.description,
          data.type,
          data.genre,
          data.franchise,
          data.franchiseNumber,
          data.isExclusive,
          data.specialFeatures,
          -1
        );
      },
      Error,
      "Invalid Market Value: -1"
    );
  });

  it("should parse data into a new Funko object", () => {
    const funko = new Funko(
      "",
      "",
      "",
      FunkoType.POP,
      FunkoGenre.ANIMATION,
      "",
      0,
      false,
      "",
      0
    ).parse(data);

    assert.instanceOf(funko, Funko);
    assert.deepEqual(funko.toJSON(), data);
  });

  it("should convert data into JSON format", () => {
    const funko = new Funko(
      data.id,
      data.name,
      data.description,
      data.type,
      data.genre,
      data.franchise,
      data.franchiseNumber,
      data.isExclusive,
      data.specialFeatures,
      data.marketValue
    );

    assert.deepEqual(funko.toJSON(), data);
  });
});
