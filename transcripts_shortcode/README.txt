This module allows transcript players to be inserted into fields through the use
of "shortcodes". The syntax is straightforward:

 [transcript id=NID profile=PID (keyword=FINDME jump=SID) /]

Required attributes are id (the node id which the transcript belongs to), and
profile (the id of the display profile you wish to use). Optional attributes
are keyword (to highlight all occurrences of a specific term) and jump (to jump
to and play a specific sentence id).

Don't forget to end the shortcode tag with /], as above.

Installation instructions:

 1. Download and enable the Shortcode module
 2. Visit admin/config/content/formats and select a text format
 3. Enable the "Shortcodes" filter
 4. Under "Filter settings", tick "Enable Transcript shortcode"
 5. Save configuration

Those allowed to use the text format you selected should now be able to embed
transcript players using the filter.

Take care when ordering filters. For example, putting "Limit allowed HTML tags"
after "Shortcodes" may render the transcript player dysfunctional by stripping
crucial but disallowed tags.

<< Last updated, 24 July 2014 >>