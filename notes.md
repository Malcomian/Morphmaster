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
document.getElementById('terminal-input').addEventListener('keydown', (event) => {
  if (event.code === 'Tab') {
    console.log('pressed tab')
    event.preventDefault()
  } else if (event.code === 'Escape') {
    console.log('pressed escape')
  }
}, false)
  ```

🥱 Okay, I fixed some issues, but the animations could still be better...

❗ There should be a sort of simplified system of accepting autocomplete arrays...

... it would be cool to be able to alter these arrays of options on the fly somehow. The notation should probably be the same as any old doc for a command list.

```text
roll [phrases]
time <set, tick, advance, etc>
load
nav <locations>
```

Would be extra-amazing if there was a special array of commands that are saved, but each command has some extra info about itself. Like, a command gets parsed just like any other args parsing algo... or maybe I'm overthinking this. It would still be useful to use some string to args utility.

The issue is getting to the point where you're multiple layers deep into some tab completion thing... I'm not sure how to structure this data to make it work best.

❗ Needs a command history - use up/down to browse.
