import { Constants } from "./constants";
import path = require("path");
import fs = require('fs'); 

export class CodeAssets {

    static getRustBlankExtensionAssetDir() {
        return this.getPath(Constants.Resources.Assets.Rust.BlankLambdaExtensionDir);
    }
    static getRustEventCollectorExtensionAssetDir() {
        return this.getPath(Constants.Resources.Assets.Rust.EventCollectorLambdaExtensionDir);
    }
    static getDotnetBlankExtensionAssetDir() {
        return this.getPath(Constants.Resources.Assets.Dotnet.BlankLambdaExtensionDir);
    }
    static getDotnetEventCollectorExtensionAssetDir() {
        return this.getPath(Constants.Resources.Assets.Dotnet.EventCollectorLambdaExtensionDir);
    }
    static getDotnetEventCollectorAotExtensionAssetDir() {
        if (!this.exists(Constants.Resources.Assets.Dotnet.EventCollectorAotLambdaExtensionDir)) {
            console.log('\x1b[33m [WARNING]: Cannot find EventCollector extension built using Native AOT. Falling back to the DLL. \x1b[0m');
            return this.getDotnetEventCollectorExtensionAssetDir();
        }
        return this.getPath(Constants.Resources.Assets.Dotnet.EventCollectorAotLambdaExtensionDir);
    }
    static getDotnetHeaderCounterFunctionAssetDir() {
        return this.getPath(Constants.Resources.Assets.Dotnet.HeaderCounterFunctionDir);
    }

    private static getPath(dir: string) {
        return path.join(__dirname, dir);
    }
    private static exists(dir: string) {
        return fs.existsSync(this.getPath(dir));
    }
}