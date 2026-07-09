# L2G Pipeline - Source Code
This is the core directory containing all the source code for the Local-to-Global (L2G) Image Retrieval system. The code has been restructured to industry standards, with a clear separation between Offline and Online environments.

## Directory Structure
- `offline/`: Contains scripts run **only once** to extract features and build an index for the image database.
- `online/`: Contains **Real-time** scripts to serve users when they upload images for searching.
- `core/`: Contains the source code of original third-party libraries/algorithms (e.g., SuperGlobal).
- `utils/`: Contains utility tools such as mAP evaluation scripts.

**Note:** Always run Python commands from the root directory of the project (`main/`), for example: `python src/offline/stage1_local_extract/extract_local.py`.
