This module helps to manage a corpus of transcripts. Typically, these transcripts
will have been time-aligned to audio or video files, but this is not required.

INSTALLATION
------------

Required: Drupal 7
          Apache Solr Search Integration
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
corresponds to a unit of transcription linked to a media file via start and end
time codes. Each tcu can be associated with any number of 'tiers', such as a 
transcription, a translation, and so on.

By default, Transcripts will include tcus as part of your site's core search
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
names of the tiers that should be searched and shown in search results. Do this
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

To index transcripts, attach a new field of type 'File' to an existing content
type. Go to the edit page for your field, and tick the box 'Treat as transcript'
under TRANSCRIPTS SETTINGS. The motivation for linking transcripts to existing
file fields is so that the module can easily plug both in and out of existing
Drupal websites. Any file field is a candidate for transcript indexing.

The Transcripts module uses the Saxon XSLT 2 processor to transform incoming
XML transcripts into tcu entities. Please see the xsl directory for further
details and examples.

Key XSL settings are at admin/config/search/apachesolr/transcripts. Users with
the 'Administer transcripts module, including managing profiles' permission can
access these settings.

 Saxon directory path
    The directory on the server where Saxon can be found. Your web server
    must be able to read this directory. This should be specified as a relative
    path from the Drupal root. We recommend sites/all/libraries/saxon
    
 Saxon jar file
    The name of the Saxon executable (e.g. saxon9he.jar), to be found inside
    the Saxon directory path.
   
 Transcript extensions
    Only files with these extensions will be transformed and indexed. This
    allows certain types of transcripts to be ignored.
    
 Default XSLT file
    The default XSL transformer for incoming transcripts. This transformer will
    be used for all transcripts unless a node-specific override is set. The 
    default transformer should be found in the Saxon directory. Use the XSL
    files in the xsl directory as a model.
    
 File field for XSLT overrides
    The name of another file field which can, if set, be used as a transcript-
    specific XSL transformer override.

Download Saxon from the following page. Transcripts has been tested with the
Saxon 9 Home Edition, although other recent versions of Saxon may also work.
After you have downloaded Saxon, copy the jar file (saxon9he.jar) to the Saxon 
directory path.

 http://saxon.sourceforge.net/

When a transcript is first uploaded, it is transformed via XSL to create tcu
entities in the Drupal database. These entities are indexed by the Apache Solr
module, making them available to the transcript players. Indexing occurs when
cron is run. Therefore, in order to view a transcript soon after uploading,
you will need to run Drupal's cron script frequently, for example every five
minutes.

If the indexing process runs into a snag, then you won't see any transcript
players. Possible problems include:

  1. The module has failed to find your server's java executable. In this case,
     it may help to add the following line to settings.php:
       $conf['transcripts_java'] = '/path/to/java';
       
  2. The XSL transformer is not generating tcus in the proper format. Apply 
     the XSL to the transcript outside of Drupal, to make sure that the output 
     is correct. Or, examine Drupal's database to confirm that tcus have been
     created in the 'tcu' table.
     
  3. The Apache Solr Search Integration module is not properly configured or 
     is not indexing tcus.
  
  4. Cron has not yet run.

As always, logs are your friend. Examine your server logs as well as the Drupal
watchdog.

 
 
TRANSCRIPT DISPLAY
------------------

Users must have the 'View transcripts' permission in order to view a transcript
player. A sensible setting is to give this permission to both anonymous and
authenticated users. This way they will be able to view all and only those
transcripts attached to nodes they can view. In addition, users must be given
permissions to view individual 'display profiles' (see below).

Display settings are configured at admin/config/search/apachesolr/transcripts
by users with the 'Administer transcripts module, including managing profiles'
permission.

First, specify which node types are allowed to have transcripts.

Next, list the transcript tiers to be searched and displayed in search results.

In order to view time-coded transcripts in synchronization with media, you must
create one or more 'display profiles'. A display profile consists of various
attributes which together define one mode of presentation of a transcript:

 Profile ID
   The unique ID for the profile.
   
 Menu
   The menu path (URL) used by the profile (transcripts/menu/nid)
   
 Tiers
   The list of transcript tiers, specified as follows:
     tier1_id|tier1_name
     tier2_id|tier2_name
     ...
     
 Display modes
   One or more of the following viewing modes:
     Interactive transcript (from Transcript Player module)
     Speech Bubbles (from Bubtitles module)
     One-line player (from Oneline Player module)

For example, you could create a 'Speech Bubbles' profile that made all data 
tiers available to the Bubtitles player. If you defined the menu as 'bubbles', 
then node id 6 would be available at the following URL:

 transcripts/bubbles/6
 
Users would require the 'View profile bubbles' permission in order to view this
profile.

You can set one profile as the 'Default transcript profile'. This will be given
a privileged URL and made available as a tab for the node:

  node/%/transcript

A second way to view transcripts is within the node itself. Locate the relevant
content type and select the MANAGE DISPLAY tab. Find your transcript file field
and select the formatter 'Transcripts player: embed' to embed the default
profile in your node view. This method of viewing transcripts is not subject to 
the usual permissions check. Transcripts displayed in this way will be visible 
to any user who can see the node. To override this behavior, consider using 
the Field Permissions module.


MAPPING INFO
------------

The 'Id mapper' field on the transcripts configuration page constructs an HTML
audio or video tag from a node id. It should return either an array of URLs in
the $val['video_url'] variable, or a fully formed tag in the $val['video_tag']
variable.

The code here is eval'd within the Transcript Player module, so this page must
be secure.


FACETED BROWSING
----------------

For faceted browsing of transcript sentences, install and enable the Facet API
module. Useful blocks include:

  Apache Solr Current Search
    If you are displaying facet blocks for empty searches, then tick 'Display 
    current search block on empty search pages' when editing the search page 
    (admin/config/search/current_search)

  Apache Solr Sorting

  Taxonomy fields

Remember that enabled facets are displayed as blocks (admin/structure/block)


VERSION HISTORY
---------------
version 0.4 (8 May 2013)

version 0.3 (28 January 2013)
  * tcus are now full-fledged entities courtesy of the tcu module
  * transcripts are only indexed if they haven't already been indexed
  * transcripts that have been changed online will not be overwritten

version 0.2 (27 January 2012)
  * updated to apachesolr 7x-beta15
  * added transcripts_editor module
  
version 0.1 (14 December 2011)


<< Last updated, 8 May 2013 >>
