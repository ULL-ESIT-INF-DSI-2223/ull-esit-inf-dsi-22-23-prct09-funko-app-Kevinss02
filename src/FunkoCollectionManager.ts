import { IFunkoData, Funko, FunkoType, FunkoGenre } from "./Funko.js";
import * as fs from "fs";
import chalk from "chalk";

/**
 * FunkoCollectionManager - Class that includes all valid Management Operations
 * upon System Funko Collection
 * @class
 */
export class FunkoCollectionManager {
  private _funkoCollection: Funko[] = [];
  private _user: string;
  
  /**
   * Constructor of FuncoCollectionMangaer class
   * @param user - Logged User 
   * @param filename - Dir where data will be stored
   * @param funkoCollection - (Optional) A collection of Funko Figures
   */
  constructor(
    user: string,
    public filename = "data",
    funkoCollection?: Funko[]
  ) {
    this._user = user;

    if (funkoCollection) {
      this._funkoCollection = funkoCollection;
    } else {
      if (!fs.existsSync(filename)) {
        fs.mkdirSync(filename);
      }

      const userDirectory = this.getUserDirectory(filename, user);
      if (!fs.existsSync(userDirectory)) {
        fs.mkdirSync(userDirectory);
      }

      this.readUserJSON(filename, user);
    }
  }
  
  /**
   * Method to get User Directory Path
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @returns Path of user directory
   */
  private getUserDirectory(filename: string, user: string): string {
    return `${filename}/${user}`;
  }
  
  /**
   * Method to get User Funko Path
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @param funkoId - Funko unique identificator
   * @returns User Funko Path
   */
  private getUserFunkoPath(
    filename: string,
    user: string,
    funkoId: string
  ): string {
    const userDirectory = this.getUserDirectory(filename, user);
    const userFunkoFilename = funkoId + ".json";
    return `${userDirectory}/${userFunkoFilename}`;
  }
  
  /**
   * Method to read a JSON file and charge data
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @returns Undefined if file does not exist
   */
  private readUserJSON(filename: string, user: string): void | undefined {
    const userDirectory = this.getUserDirectory(filename, user);
    console.log(userDirectory);
    if (!fs.existsSync(userDirectory)) {
      console.error(chalk.red(`Couldn't find ${userDirectory}`));
      return undefined;
    }

    const files = fs.readdirSync(userDirectory);
    for (const file of files) {
      const filepath = `${userDirectory}/${file}`;
      const content = fs.readFileSync(filepath, "utf-8");
      const funkoData: IFunkoData = JSON.parse(content);
      this._funkoCollection.push(
        new Funko("", "", "", FunkoType.POP, FunkoGenre.ANIMATION, "", 0, false, "", 0).parse(funkoData)
      );
    }
  }
  
  /**
   * Method to write a list of Funkos into User's Directory
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @param funkos - List of Funkos to be written
   */
  private writeUserJSON(filename: string, user: string, funkos: Funko[]): void {
    const userDirectory = this.getUserDirectory(filename, user);
    if (!fs.existsSync(userDirectory)) {
      fs.mkdirSync(userDirectory);
    }

    for (let funko of funkos) {
      const funkoData = funko.toJSON();
      const userFunkoPath = this.getUserFunkoPath(filename, user, funko.id);
      let data = JSON.stringify(funkoData, null, 2);
      fs.writeFileSync(userFunkoPath, data, "utf-8");
    }
  }
  
  /**
   * Operation to add a funko to the system
   * @param funko - Funko to be added
   */
  public addFunko(funko: Funko): void {
    if (this._funkoCollection.find((f) => f.id === funko.id)) {
      console.error(
        chalk.red(
          `A Funko with ID ${funko.id} already exists in the collection.`
        )
      );
    } else {
      this._funkoCollection.push(funko);
      this.writeUserJSON(this.filename, this._user, [funko]);
      console.log(
        chalk.green(
          `Funko with ID ${funko.id} has been added to the collection.`
        )
      );
    }
  }
  
  /**
   * Operation to modify an existing funko
   * @param funkoId - Funko unique identificator
   * @param modifiedFunko - New funko to be stored instead
   */
  public modifyFunko(funkoId: string, modifiedFunko: Funko): void {
    const index = this._funkoCollection.findIndex((f) => f.id === funkoId);
    if (index !== -1) {
      const indx = this._funkoCollection.findIndex(
        (f) => f.id === modifiedFunko.id
      );
      if (indx !== -1) {
        this._funkoCollection.splice(index, 1);
      } else {
        this._funkoCollection[index] = modifiedFunko;
      }
      const path = this.getUserFunkoPath(this.filename, this._user, funkoId);
      try {
        fs.unlinkSync(path);
      } catch (err) {
        console.error(chalk.red(`Error modifying file ${path}: ${err}`));
      }
      this.writeUserJSON(this.filename, this._user, [modifiedFunko]);
      console.log(
        chalk.green(
          `Funko with ID ${funkoId} has been modified in the collection.`
        )
      );
    } else {
      console.error(
        chalk.red(
          `A Funko with ID ${funkoId} does not exist in the collection.`
        )
      );
    }
  }
  
  /**
   * Operation to remove a funko from the system
   * @param funkoId - Funko unique identificator
   */
  public removeFunko(funkoId: string): void {
    const index = this._funkoCollection.findIndex((f) => f.id === funkoId);
    if (index !== -1) {
      this._funkoCollection.splice(index, 1);
      const path = this.getUserFunkoPath(this.filename, this._user, funkoId);
      try {
        fs.unlinkSync(path);
      } catch (err) {
        console.error(chalk.red(`Error modifying file ${path}: ${err}`));
      }
      console.log(
        chalk.green(
          `Funko with ID ${funkoId} has been removed from the collection.`
        )
      );
    } else {
      console.error(
        chalk.red(
          `A Funko with ID ${funkoId} does not exist in the collection.`
        )
      );
    }
  }

  /**
   * Opearion to list all existing funkos in user's system
   */
  public listFunkos() {
    const funkos = this._funkoCollection;
    const valorMaximo = Math.max(...funkos.map((funko) => funko.marketValue));
    const valorMinimo = Math.min(...funkos.map((funko) => funko.marketValue));
    const rango1 = valorMinimo + (valorMaximo - valorMinimo) / 4;
    const rango2 = valorMinimo + (valorMaximo - valorMinimo) / 2;
    const rango3 = valorMaximo - (valorMaximo - valorMinimo) / 4;

    funkos.forEach((funko) => {
      let colorValor = "";
      if (funko.marketValue <= rango1) {
        colorValor = chalk.red(funko.marketValue);
      } else if (funko.marketValue <= rango2) {
        colorValor = chalk.yellow(funko.marketValue);
      } else if (funko.marketValue <= rango3) {
        colorValor = chalk.blue(funko.marketValue);
      } else {
        colorValor = chalk.green(funko.marketValue);
      }
      console.log(
        chalk`{bold (${funko.id}) ${funko.name}} ({italic ${funko.type}}) - ${funko.description} - SpecialFeatures: ${funko.specialFeatures} - Genre: ${funko.genre} - Franchise: ${funko.franchise} - FranchiseNumber: ${funko.franchiseNumber} - Exclusive: ${funko.isExclusive} - MarketValue: ${colorValor} $`
      );
    });
  }

  /**
   * Operation to show information about an unique existing funko in user's system
   */
  public showFunko(funkoId: string) {
    const funkos = this._funkoCollection;
    const funko = funkos.find((funko) => funko.id === funkoId);
    if (funko) {
      const valorMaximo = Math.max(...funkos.map((funko) => funko.marketValue));
      const valorMinimo = Math.min(...funkos.map((funko) => funko.marketValue));
      const rango1 = valorMinimo + (valorMaximo - valorMinimo) / 4;
      const rango2 = valorMinimo + (valorMaximo - valorMinimo) / 2;
      const rango3 = valorMaximo - (valorMaximo - valorMinimo) / 4;

      let colorValor = "";
      if (funko.marketValue <= rango1) {
        colorValor = chalk.red(funko.marketValue);
      } else if (funko.marketValue <= rango2) {
        colorValor = chalk.yellow(funko.marketValue);
      } else if (funko.marketValue <= rango3) {
        colorValor = chalk.blue(funko.marketValue);
      } else {
        colorValor = chalk.green(funko.marketValue);
      }
      console.log(
        chalk`{bold (${funko.id}) ${funko.name}} ({italic ${funko.type}}) - ${funko.description} - SpecialFeatures: ${funko.specialFeatures} - Genre: ${funko.genre} - Franchise: ${funko.franchise} - FranchiseNumber: ${funko.franchiseNumber} - Exclusive: ${funko.isExclusive} - MarketValue: ${colorValor} $`
      );
    } else {
      console.log(
        chalk.red(`Error. Funko with ${funkoId} does not exist in system`)
      );
    }
  }
}
