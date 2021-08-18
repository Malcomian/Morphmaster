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
