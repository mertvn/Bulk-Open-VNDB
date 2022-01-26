# Bulk Open VNDB

Opens VNDB and EGS pages for VNs found using the VNDB search pages.

Only works on VN and Char search pages.

Only works on Grid display mode.

Only tested on Firefox (78.8.0esr) with Violentmonkey.

Waits 3 seconds between opening new tabs in order to not get rate-limited.

## TODO
* Bypass spoiler restrictions for chars.
* Check if it's possible to grab EGS urls from the VNDB tab we open.
* Fix getting rate-limited for char pages (^ might fix it).
* Better logic for selecting the correct EGS release (Right now we select the first complete release with an EGS link).
