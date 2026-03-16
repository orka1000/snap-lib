export async function fetchBookCover(title: string, author: string): Promise<string | null> {
  if (!title) return null;
  
  // Try OpenLibrary first for a higher quality cover
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const olRes = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
    
    if (olRes.ok) {
      const olData = await olRes.json();
      if (olData.docs && olData.docs.length > 0) {
        const cover_i = olData.docs[0].cover_i;
        if (cover_i) {
          return `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`;
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch from OpenLibrary', e);
  }

  // Fallback to Google Books
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const imageLinks = data.items[0].volumeInfo?.imageLinks;
      if (imageLinks) {
        // Prefer thumbnail, fallback to smallThumbnail
        let url = imageLinks.thumbnail || imageLinks.smallThumbnail;
        if (url) {
          // Force HTTPS to avoid mixed content warnings
          url = url.replace('http:', 'https:');
          // Remove the edge curl effect often added by Google Books
          url = url.replace('&edge=curl', '');
          // Request a slightly larger zoom level if possible
          url = url.replace('zoom=1', 'zoom=3');
          return url;
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch book cover from Google Books', e);
  }
  
  return null;
}
