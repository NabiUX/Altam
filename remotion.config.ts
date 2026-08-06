import { Config } from "@remotion/cli/config";

// Salida en alta calidad, sobrescribiendo el archivo anterior en cada render.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
