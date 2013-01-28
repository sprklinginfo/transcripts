This module helps to manage a corpus of transcripts. Typically, these transcripts
will have been time-aligned to audio or video files, but this is not required.

INSTALLATION
------------

Required: Drupal 7
          Apache Solr Search Integration (7.x-1.1 or above)
          Time Code Unit (tcu)

Optional: Facet API, Shortcode

Install and enable the Transcripts and Transcript Player modules as you would any
other Drupal modules. If you want additional viewing options, you may wish to
install the Bubtitles or One-line player modules as well.


CONFIGURING TRANSCRIPT SEARCH
-----------------------------

The Transcripts module transforms uploaded transcripts into a form that can be
indexed by Solr using the Apache Solr Search Integration module. 

The Time Code Unit (tcu) module introduces a new entity type and bundle that
correponds to a unit of transcription linked to a media file via start and end
time codes. A tcu can have attributes of tiers, such as a transcription,
translation, and so on.

By default, Transcripts will include tcus are part of your site's core search
results. To exclude tcus from ordinary search results, go to:

  admin/config/search/apachesolr/search-pages

and edit 'Core Search'. Click on 'Custom Filter' and enter -bundle:tcu as your 
filter, and then save the configuration.

Conversely, to create a custom search page just for tcus, go to the above page
and click on "Add search page configuration". There, create a configuration with 
the following values (for example):

 Label = Transcripts
 Title = Transcripts
 Path = search/transcripts
 Custom filters = bundle:tcu
 
Save the configuration and your page will be available as a new search tab.

For transcript data to show up in search results, you must tell the module the
names of all tiers that should be searched and shown in search results. Do this
by providing a comma-separated list of "Transcript tiers". For example, using
the tiers mentioned in the README.txt file in the xsl directory:

 ts_said, ts_meant

By default, the module will assume that search results should link directly to
nodes, passing a fragment identifier if necessary. This works well when you are
including a transcript player as part of the display of the node (see below).
Otherwise, you can link from search results to any display profile by changing
the "Link results to" setting.


INDEXING TRANSCRIPTS
--------------------

To index transcripts, attach a new field of type "file" to an existing content
type. Go to the edit page for your field, and tick the box "Treat as transcript"
under TRANSCRIPTS SETTINGS. The motivation for linking transcripts to existing
file fields is so that the module can easily plug both in and out of existing
Drupal websites. Any file field is a candidate for transcript indexing.

The Transcripts module will then attempt to index files attached to the field,
using the following settings (see admin/config/search/apachesolr/transcripts):

 Transcript extensions : only files with these extensions will be indexed
 Saxon directory path : the directory on the server where Saxon can be found
 Saxon jar file : the name of the Saxon executable (e.g. saxon9he.jar)
 XSLT file : the name of the file that transforms the XSL

The module uses the Saxon XSLT 2 processor to transform XML transcripts into a
form that can be posted to Solr. For further details and examples see the xsl
directory.

Both the Saxon jar file and your XSL file should be located in the Saxon
directory path. Saxon-HE is open source. Download it from the following page:

 http://saxon.sourceforge.net/
 
Then copy saxon9he.jar to your server's Saxon directory path.

Transcripts are indexed when nodes are sent to Solr (usually by running cron).
If you find that your transcripts have not been indexed, then this could be
because the module has failed to find your server's java executable. In that
case, it may help to add the following line to settings.php:

 $conf['transcripts_java'] = '/path/to/java';
 
 
VIEWING TRANSCRIPTS
-------------------

Users must have the 'view transcripts' permission in order to view a transcript
player. A sensible setting is to give this permission to both anonymous and
authenticated users. This way they will be able to view all and only those
transcripts attached to nodes they can view.

In order to view time-coded transcripts in synchronization with media, you must
create one or more "display profiles". A display profile consists of various
attributes which together define one mode of presentation of a transcript:

 Profile id : the unique id for the profile
 Menu : the menu path used by the profile (transcripts/menu/nid)
 List of transcript tiers : tier1_id|tier1_name
                            tier2_id|tier2_name
                            etc.
 Display modes : one or more of the following viewing modes:
                   Interactive transcript (from Transcript Player module)
                   Bubtitles (from Bubtitles module)
                   One-line player (from Oneline Player module)

For example, you could create a "bubtitles" profile that made all data tiers
available to the Bubtitles player. If you defined the menu as "bubtitles", then
node id 6 would be available at the following URL:

 transcripts/bubtitles/6
 
Note, however, that in order for a user to view the profile, she must have the
permission "View profile bubtitles".

A second way to view transcripts is within the node itself. Locate the relevant
content type and select the MANAGE DISPLAY tab. Find your transcript file field
and select a formatter such as "Transcripts: bubtitles" (to use the just-
defined profile as an example).

Note that the second method for viewing transcripts is not subject to the
permissions check. Transcripts displayed in this way will be visible to all users.
To override this behavior, consider using the Field Permissions module.


MAPPING INFO
------------

The "Id mapper" field on the configuration page is how the module maps a node id
to a transcript and video. This code is eval'd within the Transcript Player
module, so care should be taken to secure this page. Here is an example of what
you might put in this field, assuming a content type with two file fields, one 
for the video and one for the transcript:

 $node = node_load($id);
 if (isset($node->field_transcript) && isset($node->field_video)) {
   $transcript = $node->field_transcript[$node->language][0]['fid'];
   $videourl = $node->field_video[$node->language][0]['url'];
   $videotag = "<video controls src='".$videourl."'>";
   $val = array(
     'video_tag' => $videotag,
     'transcript_id' => $transcript,
   );
 }

$val['transcript_id'] should always refer to the file id of the transcript file.


FACETED BROWSING
----------------

For faceted browsing of transcript sentences, install and enable the Facet API
module. Useful blocks include:

* Apache Solr Current Search: if you are displaying facet blocks for empty
searches, then tick "Display current search block on empty search pages" when
editing the search page (admin/config/search/current_search).

* Apache Solr Sorting

* Taxonomy fields: fields of type taxonomy_term_reference are inherited from
parent nodes to transcript sentences, so you may want to facet sentences based
on these fields.

Remember that enabled facets are displayed as blocks (admin/structure/block).


VERSION HISTORY
---------------
version 0.1 (14 December 2011)

version 0.2 (27 January 2012)
  * updated to apachesolr 7x-beta15
  * added transcripts_editor module
  
version 0.3 (28 January 2013)
  * tcus are now full-fledged entities courtesy of the tcu module
  * transcripts are only indexed if they haven't already been indexed
  * transcripts that have been changed online will not be overwritten
