import { declareIndexPlugin, ReactRNPlugin } from "@remnote/plugin-sdk";

export const DIVIDER = "divider";

let DividerCSS: string;

async function onActivate(plugin: ReactRNPlugin) {
  await fetch("https://raw.githubusercontent.com/browneyedsoul/RemNote-Divider/main/src/snippet.css")
    .then((response) => response.text())
    .then((text) => {
      DividerCSS = text;
      console.dir("Divider Installed!");
    })
    .catch((error) => console.error(error));
  await plugin.app.registerCSS("rem-tree", DividerCSS);

  await plugin.settings.registerStringSetting({
    id: "color",
    title: "Text Color (hex)",
    description: "Provide a hex color for the text",
    defaultValue: "#ff0000",
  });
  await plugin.settings.registerStringSetting({
    id: "height",
    title: "Line Height (px)",
    description: "Height of the Divider Area",
    defaultValue: "10",
  });
  // Each time the setting changes, re-register the css.
  plugin.track(async (reactivePlugin) => {
    const color = await reactivePlugin.settings.getSetting("color");
    await reactivePlugin.app.registerCSS(
      "color",
      `
      [data-rem-tags~="Divider"] {
        color: ${color};
      }
      `
    );
  });
  plugin.track(async (reactivePlugin) => {
    const height = await reactivePlugin.settings.getSetting<string>("height");
    try {
      const heightAsNumber = Number.parseInt(height);
      await reactivePlugin.app.registerCSS(
        "height",
        `
        [data-rem-tags~="Divider"] {
          height: ${heightAsNumber}px;
        }
        `
      );
    } catch {}
  });
  await plugin.app.registerPowerup("Divider", DIVIDER, "Rem Containing Horizontal Line", { slots: [] });
  await plugin.app.registerCommand({
    id: "divider",
    name: "Divider",
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      await rem?.addPowerup(DIVIDER);
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
