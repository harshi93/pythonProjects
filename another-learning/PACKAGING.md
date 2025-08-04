# Packaging and distribution GUI apps with kivy

# For Mac, Linux and Windows:
1. Install Pyinstaller
2. Run `python3 -m PyInstaller -w --onefile`
   1. `w` flag tells pyinstaller it's windowed application and `--onefile` tells it to generate a single binary for distribution purposes
3. In Linux, the binary would be under `dist/`
4. To build for windows is, underlying os needs to be windows and we need to modify `calculator.spec` to include following lines
       1. `from kivy_deps import sdl2, glew`
       2. under coll = COLLECT(
                        a.datas
                        *[Tree(p) for p in (sdl2.dep_bins + glew.dep_bins)],
                        strip=False)
   1. lastly run the command `python -m PyInstaller calculator.spec`
5. Look under `kivy/dist/` and you should see single file
