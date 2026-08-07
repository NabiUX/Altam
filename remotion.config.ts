import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// Salida en alta calidad, sobrescribiendo el archivo anterior en cada render.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// Activa Tailwind v4 en el bundler (los componentes del CRM lo usan).
Config.overrideWebpackConfig(enableTailwind);
