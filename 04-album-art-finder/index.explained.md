# index.js Line-by-Line Explanation

Line numbers match the current `index.js` in this workspace.

L1: `/*` starts a block comment used as a header for the assignment.
L2: Decorative separator line inside the header comment.
L3: Title of the project inside the header comment.
L4: Decorative separator line inside the header comment.
L5: Placeholder line for a student ID.
L6: Placeholder line for a required comment.
L7: Blank line to separate sections inside the comment.
L8: Decorative separator line inside the header comment.
L9: `*/` ends the header block comment.
L10: Loads Node's `fs` module for filesystem access.
L11: Loads Node's `http` module to create the server.
L12: Loads Node's `https` module for outbound HTTPS calls (Spotify, images).
L13: Loads Node's `path` module for OS-safe path handling.
L14: Loads `querystring` to build URL-encoded query strings.
L15: Defines the port number the server will listen on.
L16: Creates an HTTP server instance.
L17: Imports `client_id` and `client_secret` from local credentials.
L18: Blank line to separate setup blocks.
L19: Comment describing the next two directory constants.
L20: Builds an absolute path to the local album-art folder.
L21: Builds an absolute path to the local cache folder.
L22: Blank line to separate setup blocks.
L23: Ensures the album-art folder exists before use.
L24: Ensures the cache folder exists before use.
L25: Blank line to separate the header comment block that follows.
L26: Starts a long explanatory comment about piping streams.
L27: Separator line within the comment.
L28: Comment section title: piping in Node streams.
L29: Separator line within the comment.
L30: Blank line inside the comment for readability.
L31: Example code line showing `createReadStream`.
L32: Example code line showing `.pipe(res)`.
L33: Blank line inside the comment for readability.
L34: Explanation of how piping avoids manual chunk handling.
L35: Blank line inside the comment.
L36: Introduces a code example from this app.
L37: Example code line for creating a stream of `main.html`.
L38: Example code line piping the HTML stream to the response.
L39: Explains what the example does.
L40: Separator line within the comment.
L41: Ends the piping explanation comment block.
L42: Registers `connection_handler` to handle every incoming request.
L43: Inline comment describing the main request router.
L44: Declares the request handler function signature.
L45: Logs the incoming URL and client address to the console.
L46: Checks if the request is for the root or index page.
L47: Streams `main.html` as an HTML response and returns early.
L48: Closes the first `if` block.
L49: Checks if the request is for the favicon.
L50: Streams the favicon file with the icon MIME type and returns.
L51: Closes the favicon `if` block.
L52: Checks if the request is for the banner image.
L53: Streams the banner image and returns.
L54: Closes the banner `if` block.
L55: Checks if the request is for cached album-art images.
L56: Delegates to `serve_album_art` and returns.
L57: Closes the album-art `if` block.
L58: Checks if the request is for a search route.
L59: Delegates to `handle_search` and returns.
L60: Closes the search `if` block.
L61: Falls back to a 404 response for any unknown path.
L62: Ends the `connection_handler` function.
L63: Blank line to separate function definitions.
L64: Comment describing the directory creation helper.
L65: Declares `ensure_directory`, which makes missing directories.
L66: Checks whether the directory already exists.
L67: Creates the directory path recursively if it is missing.
L68: Closes the `if` block inside `ensure_directory`.
L69: Ends the `ensure_directory` function.
L70: Blank line to separate helper functions.
L71: Comment describing the file streaming helper.
L72: Declares `stream_file` with response, path, and MIME type.
L73: Creates a readable stream for the requested file.
L74: Attaches a handler for the stream's `ready` event.
L75: Sends a 200 status with the provided Content-Type.
L76: Pipes the file stream into the HTTP response.
L77: Closes the `ready` handler.
L78: On stream error, sends a 404 response.
L79: Ends the `stream_file` function.
L80: Blank line to separate helper functions.
L81: Comment describing the plain-text response helper.
L82: Declares `send_text` for simple error or status messages.
L83: Checks if headers are already sent to avoid double writes.
L84: Ends the response immediately if headers are already sent.
L85: Closes the `if` guard in `send_text`.
L86: Sends the status code and plain-text Content-Type.
L87: Ends the response with the provided message text.
L88: Ends the `send_text` function.
L89: Blank line to separate helper functions.
L90: Comment describing the album-art serving helper.
L91: Declares `serve_album_art` for image requests.
L92: Parses the incoming URL using the host header.
L93: Extracts just the filename from the URL path.
L94: Guards against missing or invalid filenames.
L95: Sends a 404 error if the filename is invalid.
L96: Closes the invalid filename `if` block.
L97: Builds the absolute path to the album art file.
L98: Streams the image as a JPEG response.
L99: Ends the `serve_album_art` function.
L100: Blank line to separate handlers.
L101: Comment describing the search handler workflow.
L102: Declares `handle_search` for `/search` requests.
L103: Parses the incoming URL for query parameters.
L104: Reads and trims the `artist` query parameter.
L105: Checks for a missing or empty artist name.
L106: Sends a 400 error when the artist name is missing.
L107: Closes the missing artist `if` block.
L108: Checks whether Spotify credentials are available.
L109: Sends a 500 error if credentials are missing.
L110: Closes the credentials check `if` block.
L111: Builds a cache file path based on the artist name.
L112: Reads the cache file asynchronously as UTF-8 text.
L113: Checks for a successful cache read.
L114: Starts a `try` block to parse cached JSON.
L115: Parses the cached JSON into a JS object.
L116: Uses cached results to render a response immediately.
L117: Starts the `catch` block for invalid JSON.
L118: Comment noting invalid cache will fall through to refetch.
L119: Ends the `catch` block (no action taken).
L120: Handles read errors that are not "file not found".
L121: Sends a 500 error if the cache file cannot be read.
L122: Closes the cache read error `else if` block.
L123: Requests a new Spotify token and search on cache miss.
L124: Ends the `readFile` callback.
L125: Ends the `handle_search` function.
L126: Blank line to separate handlers.
L127: Comment describing Spotify token retrieval.
L128: Declares `request_access_token` for OAuth token requests.
L129: Encodes client credentials as base64 for HTTP Basic auth.
L130: Creates URL-encoded POST body for the token grant.
L131: Starts the request options object.
L132: Sets the HTTP method to POST.
L133: Starts the headers object.
L134: Adds the Basic Authorization header.
L135: Adds the form-encoded Content-Type header.
L136: Adds Content-Length so Spotify knows body size.
L137: Closes the headers object.
L138: Closes the options object.
L139: Blank line to separate options from request creation.
L140: Defines the Spotify token endpoint URL.
L141: Creates the HTTPS request and defines the response handler.
L142: Collects and parses JSON from the token response.
L143: Validates success status and access token presence.
L144: Sends a 502 error if token retrieval fails.
L145: Closes the token failure `if` block.
L146: Calls `search_spotify` with the access token.
L147: Closes the `collect_json` callback.
L148: Closes the HTTPS request callback.
L149: Adds a network error handler for the token request.
L150: Sends the POST body and ends the token request.
L151: Ends the `request_access_token` function.
L152: Blank line to separate handlers.
L153: Comment describing the Spotify search request.
L154: Declares `search_spotify` to query the Spotify API.
L155: Builds the query string for artist, type, and limit.
L156: Starts the options object for the search request.
L157: Starts the headers object.
L158: Adds the Bearer token for authorization.
L159: Closes the headers object.
L160: Closes the options object.
L161: Builds the full search endpoint URL with query string.
L162: Creates the HTTPS request and response handler.
L163: Collects and parses JSON from the search response.
L164: Validates success status and presence of data.
L165: Sends a 502 error when the search fails.
L166: Closes the search failure `if` block.
L167: Writes the raw search JSON to the cache file.
L168: Processes results and renders the HTML response.
L169: Closes the `collect_json` callback.
L170: Closes the HTTPS request callback.
L171: Adds a network error handler for the search request.
L172: Ends the search request (no request body).
L173: Ends the `search_spotify` function.
L174: Blank line to separate helpers.
L175: Comment describing JSON collection helper.
L176: Declares `collect_json` for streaming JSON bodies.
L177: Initializes a string to accumulate response chunks.
L178: Attaches a handler for incoming data chunks.
L179: Appends each chunk to the body string.
L180: Closes the `data` handler.
L181: Attaches a handler for the end of the stream.
L182: Initializes parsed data to `null`.
L183: Starts a `try` block for JSON parsing.
L184: Parses the accumulated body as JSON.
L185: Starts the `catch` block for parse errors.
L186: Leaves `data` as `null` when parsing fails.
L187: Ends the `try/catch` block.
L188: Calls the callback with HTTP status and parsed data.
L189: Closes the `end` handler.
L190: Ends the `collect_json` function.
L191: Blank line to separate helpers.
L192: Comment describing result handling workflow.
L193: Declares `handle_spotify_results`.
L194: Extracts the album list safely or falls back to empty.
L195: Downloads album art, then renders the page.
L196: Calls `render_results_page` once art is cached.
L197: Closes the cache callback.
L198: Ends the `handle_spotify_results` function.
L199: Blank line to separate helpers.
L200: Comment describing album art caching logic.
L201: Declares `cache_album_art`.
L202: Initializes a counter for pending image downloads.
L203: Iterates over each album in the results list.
L204: Pulls the first image (largest) from the album.
L205: Checks for missing image data.
L206: Sets an empty local image path for missing art.
L207: Skips further processing for this album.
L208: Closes the missing image `if` block.
L209: Builds a deterministic filename using the album ID.
L210: Builds the full path to the album art file.
L211: Sets the local URL that will be used in HTML.
L212: Checks if the file already exists on disk.
L213: Skips downloading when cached file is present.
L214: Closes the cache-hit `if` block.
L215: Increments the pending download count.
L216: Creates a writable stream for the image file.
L217: Initializes a guard to avoid double-calling `done`.
L218: Declares the `done` helper for completion logic.
L219: Returns early if `done` already ran.
L220: Closes the `finished` guard `if`.
L221: Marks the download as finished.
L222: Decrements the pending count.
L223: Checks if all pending downloads are complete.
L224: Calls the callback when the last download finishes.
L225: Closes the `pending === 0` `if` block.
L226: Ends the `done` helper function.
L227: Attaches error handling to the file stream.
L228: Closes the `file.on("error")` line.
L229: Starts an HTTPS GET to the image URL.
L230: Checks for non-200 responses from the image server.
L231: Closes the file and marks done on bad status.
L232: Returns early after handling bad status.
L233: Closes the bad-status `if` block.
L234: Pipes the image stream into the file stream.
L235: Closes the file and marks done on finish.
L236: Handles errors on the image stream.
L237: Handles network errors on the HTTPS request itself.
L238: Ends the `forEach` iteration.
L239: Checks for the edge case of zero pending downloads.
L240: Defers callback to the next tick when nothing downloaded.
L241: Closes the `pending === 0` `if` block.
L242: Ends the `cache_album_art` function.
L243: Blank line to separate helpers.
L244: Comment describing the HTML rendering helper.
L245: Declares `render_results_page`.
L246: Escapes the artist name for safe HTML output.
L247: Sends a 200 status with HTML Content-Type.
L248: Begins writing the HTML template string to the response.
L249: Outputs the opening `<html>` tag.
L250: Outputs the opening `<head>` tag.
L251: Outputs the page `<title>` line.
L252: Opens the `<style>` block for inline CSS.
L253: Starts the `body` CSS rule.
L254: Sets automatic side margins for centering.
L255: Sets a maximum width for the layout.
L256: Sets the font family for the page.
L257: Prevents horizontal overflow.
L258: Closes the `body` CSS rule.
L259: Starts the `header` CSS rule.
L260: Adds vertical margins around the header.
L261: Closes the `header` CSS rule.
L262: Starts the `form` CSS rule.
L263: Sets the form to flex layout.
L264: Adds spacing between flex items.
L265: Vertically centers the flex items.
L266: Adds bottom margin below the form.
L267: Closes the `form` CSS rule.
L268: Starts the `form input[type="text"]` rule.
L269: Makes the text input grow to fill available space.
L270: Adds padding inside the text input.
L271: Closes the text input rule.
L272: Starts the `.grid` CSS rule for the album layout.
L273: Uses CSS Grid for the album layout.
L274: Defines responsive columns with a min width of 160px.
L275: Adds gaps between grid items.
L276: Closes the `.grid` CSS rule.
L277: Starts the `figure` CSS rule.
L278: Removes default figure margin.
L279: Closes the `figure` CSS rule.
L280: Starts the `figure img` CSS rule.
L281: Makes images scale to the figure width.
L282: Keeps the image height proportional.
L283: Removes inline spacing with `display: block`.
L284: Closes the `figure img` CSS rule.
L285: Starts the `figcaption` CSS rule.
L286: Adds spacing above captions.
L287: Sets the caption font size.
L288: Closes the `figcaption` rule.
L289: Starts the `.placeholder` CSS rule for missing art.
L290: Sets a light gray background for placeholders.
L291: Sets a darker gray text color for placeholders.
L292: Sets a fixed height matching typical art.
L293: Uses flex layout for centering text.
L294: Vertically centers the placeholder text.
L295: Horizontally centers the placeholder text.
L296: Centers the placeholder text alignment.
L297: Adds padding inside the placeholder box.
L298: Uses `border-box` sizing for consistent box size.
L299: Closes the `.placeholder` rule.
L300: Closes the `<style>` block.
L301: Closes the `<head>` block.
L302: Opens the `<body>` block.
L303: Opens the `<header>` block.
L304: Writes a link with the banner image back to `/`.
L305: Closes the `<header>` block.
L306: Opens the `<form>` for search input.
L307: Outputs the label for the artist input.
L308: Outputs the text input with the escaped artist value.
L309: Outputs the submit button.
L310: Closes the `<form>` block.
L311: Outputs a heading showing the current artist.
L312: Opens the grid container for album cards.
L313: Ends the initial template write call.
L314: Checks if the album list is empty.
L315: Writes a "No albums found" paragraph when empty.
L316: Starts the `else` block for non-empty results.
L317: Iterates over each album result.
L318: Escapes and stores the album name for safe HTML.
L319: Pulls the album's Spotify link if available.
L320: Reads the local image URL stored during caching.
L321: Starts a conditional expression to build the image markup.
L322: If an image exists, builds an `<img>` tag.
L323: Otherwise, builds a placeholder `<div>`.
L324: Starts a template string for the figure content.
L325: Inserts the image tag or placeholder markup.
L326: Adds a `<figcaption>` with the album name.
L327: Ends the figure content template string.
L328: Checks if a Spotify link exists for the album.
L329: Writes a linked `<figure>` when a Spotify URL exists.
L330: Starts the `else` for albums without a link.
L331: Writes a plain `<figure>` without a link.
L332: Closes the album link `if` block.
L333: Ends the `forEach` loop.
L334: Closes the `else` for non-empty results.
L335: Ends the response with the closing HTML template.
L336: Outputs the closing `</div>` for the grid.
L337: Outputs the closing `</body>` tag.
L338: Outputs the closing `</html>` tag.
L339: Ends the `render_results_page` function.
L340: Blank line to separate helpers.
L341: Comment describing the HTML escaping helper.
L342: Declares `escape_html`.
L343: Converts input to string and replaces unsafe characters.
L344: Starts a `switch` to map each unsafe character.
L345: Replaces `&` with `&amp;`.
L346: Replaces `<` with `&lt;`.
L347: Replaces `>` with `&gt;`.
L348: Replaces `"` with `&quot;`.
L349: Replaces `'` with `&#39;`.
L350: Returns the original character for all other cases.
L351: Ends the `switch` block.
L352: Ends the replace callback function.
L353: Ends the `escape_html` function.
L354: Blank line to separate helpers.
L355: Comment describing filename sanitization.
L356: Declares `safe_filename`.
L357: Lowercases the input string for consistency.
L358: Replaces non-alphanumeric runs with underscores.
L359: Trims leading/trailing underscores or falls back to `search`.
L360: Ends the `safe_filename` function.
L361: Blank line to separate server setup.
L362: Registers the listening handler on the server.
L363: Comment describing the listening log.
L364: Declares `listening_handler`.
L365: Logs the port once the server starts listening.
L366: Ends the `listening_handler` function.
L367: Blank line to separate final server start.
L368: Starts the HTTP server listening on the configured port.
