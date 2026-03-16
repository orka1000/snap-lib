export async function fetchBookCover(title: string, author: string): Promise<string | null> {
  if (!title) return null;
  
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
          url = url.replace('zoom=1', 'zoom=2');
          return url;
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch book cover from Google Books', e);
  }
  
  return null;
}
