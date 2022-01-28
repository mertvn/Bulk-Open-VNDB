![screenshot](https://user-images.githubusercontent.com/78761720/151611319-c13d0378-5f45-48e3-8759-2a304aa783eb.png)
# Bulk Open VNDB

Opens VNDB and EGS pages for VNs found using the VNDB search pages.

Only works on VN and Char search pages.

Only works on Grid display mode.

Only tested on Firefox, with Violentmonkey and Tampermonkey.

Tries to work around the rate-limit but it's not perfect, so the recommended max grid size is 25 for now.

The combobox is for selecting what rule should be applied for finding the URL(s) of EGS pages.

A fallback to the first rule is observed if the more specific rules yield no results.

## [Install](https://raw.githubusercontent.com/mertvn/Bulk-Open-VNDB/master/bulk-open-vndb.user.js)

### TODO
* Bypass spoiler restrictions for chars.
* Check if it's possible to grab EGS urls from the VNDB tab we open.
* Open Char page option.
