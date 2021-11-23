# Notes

Developer notes on Morphmaster - completed features, todo roadmap, etc.

## TODO

❓ Refactor gen command to have an optional URL, in which case no controller or route will be assigned to it. Useful for when making services and directives, maybe?

✅ Either refactor keybinds class or create a new class for handling the window's various keyboard commands. --- implemented with a simple mousetrap instance thing that rebinds some of the important stuff and adds some triggerAll and unbindAll functionality that handles arrays of codes.

❗ Add a page for changing or adding keybinds for the whole window (like an options or settings page).

❗ Add a page for handling a changelog. The changelog would only be editable in development mode, but should also be viewable in production.

---

### Terminal

Offcanvas isn't a particularly well designed feature of bootstrap. The terminal is suffering for it. The animation isn't even that great, to begin with. Clicking the terminal button should just force a css class and there should just be some transition/animation rules on the terminal div.

Escape shouldn't mess you up out of the terminal window. It should just blur the terminal input.

I can fix this with vanilla javascript...

```javascript
document.getElementById("terminal-input").addEventListener(
  "keydown",
  (event) => {
    if (event.code === "Tab") {
      console.log("pressed tab");
      event.preventDefault();
    } else if (event.code === "Escape") {
      console.log("pressed escape");
    }
  },
  false
);
```

🥱 Okay, I fixed some issues, but the animations could still be better...

❗ There should be a sort of simplified system of accepting autocomplete info... Like, analyzing multidimensional arrays might work. It's like I need to manage a list of "possibilities", as if it were a search bar. It would also be cool to include these actions in a menu, too.

... it would be cool to be able to alter these arrays of options on the fly somehow. The notation should probably be the same as any old doc for a command list.

```text
roll [phrases]
time <set, tick, advance, etc>
load?
nav <locations>
quit [countdown]
```

... okay, so it would be like nested objects with the keys of the objects also being a list of what they should complete towards...

```javascript
var auto = {
  roll: {
    attack: {
      //
    },
  },
};
```

... or maybe a series of class-based objects with name properties and such. I guess it depends on whether I want immediate tab completion or the type of tab completion you see in a real terminal, where you can tab through multiple options...

```javascript
var auto = {
  roll: ["melee", "ranged", "grapple"],
  time: [{}]
};
```

```javascript
class Auto {
  constructor(phrase, children) {
    this.phrase = phrase
    this.children = children
  }
}

var completions = [
  new Auto('roll', ['melee', 'ranged', 'grapple'])
]
```

See, the main reason for the autocompletion thing needing to be customizable is that I need to be able to roll specially saved abilities and whatever from each character that's loaded into an encounter.

```text
roll @<target> <phrase or expression>
```

😫 As far as I can tell, the tab completion completely ruins the undo/redo states of the input. The only way to fix this is to intercept any input commands within the input field and set handlers for ctrl+z/ctrl+shift+z.

❗ 😑 Needs a command history - use up/down to browse.

!!! so, as a rule, I should probably remind myself to not overuse filters. I think the template filters are silly and unnecessary. They should just be functions on the scope so you would write something like `{{youtube('code', 640, 480)}}` instead of `{{'code' | youtube:640, 480}}`. It's way more concise. The reason why I invented that filter was so that it would function as something akin to a template literal expression. I have to use $sce.trustAsHTML() to get the job done in the case of youtube embed codes. Any iframe falls under this effect inside angular, I think.

If I were to find a way to use the app with only lodash and some jquery thing, then that'd be different. It would probably be an overall better approach anyways considering the complexity of some apps, but I definitely lose a lot of great features like debounce, filters, a nice frontend router, etc. - Angular certainly has it all.
