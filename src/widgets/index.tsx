import { declareIndexPlugin, FocusEvents, ReactRNPlugin } from "@remnote/plugin-sdk";

export const DIVIDER = "divider";

let DividerCSS: string;
let DividerText = `---`;

async function onActivate(plugin: ReactRNPlugin) {
  try {
    const localResponse = await fetch("snippet.css");
    const localCSS = await localResponse.text();
    DividerCSS = localCSS;
    console.dir("Divider Installed from local path!");
  } catch (localError) {
    console.warn(`Failed to fetch local file: ${localError}. Falling back to remote URL.`);
    const remoteResponse = await fetch(
      "https://raw.githubusercontent.com/browneyedsoul/RemNote-Divider/main/src/snippet.css"
    );
    const remoteCSS = await remoteResponse.text();
    DividerCSS = remoteCSS;
    console.dir("Divider Installed from CDN");
  }

  await plugin.app.registerCSS("divider", DividerCSS);

  await plugin.settings.registerStringSetting({
    id: "height",
    title: "Line Height (px)",
    description: "Height of the Divider Area",
    defaultValue: "7",
  });
  plugin.track(async (reactivePlugin) => {
    const height = await reactivePlugin.settings.getSetting<string>("height");
    const heightAsNumber = await Number.parseInt(height);
    await reactivePlugin.app.registerCSS(
      "height",
      `
      #hierarchy-editor .rem[data-rem-tags~="divider"] {
        min-height: ${heightAsNumber}px;
      }
      `
    );
  });
  await plugin.app.registerPowerup("Divider", DIVIDER, "Rem Containing Horizontal Line", { slots: [] });

  async function mkdiv() {
    const rem = await plugin.focus.getFocusedRem();

    if (await rem?.hasPowerup(DIVIDER) === true) {
      rem?.removePowerup(DIVIDER);
      await plugin.editor.moveCaret(99, 6);
      await plugin.editor.deleteCharacters(99, -1);
    } else {
      rem?.addPowerup(DIVIDER);
      await plugin.editor.moveCaret(99, 6);
      await plugin.editor.deleteCharacters(99, -1);
      await plugin.editor.insertPlainText(DividerText);
      await plugin.editor.moveCaretVertical(1);
    }
  }

  await plugin.app.registerCommand({
    id: "divider",
    name: "Divider",
    action: async () => {
      await mkdiv();
    },
  });
  await plugin.event.addListener(
    FocusEvents.FocusedRemChange,
    undefined,
    async (e: KeyboardEvent) => {
      const focusedRem = await plugin.focus.getFocusedRem();

      if (await focusedRem?.hasPowerup(DIVIDER) === true) {
        if (await  e.code === "Backspace" || e.code === "Delete") {
          e.preventDefault();
          await focusedRem?.removePowerup(DIVIDER);
          await plugin.editor.delete();
        }
      }
    }
  );
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);