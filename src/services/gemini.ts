import { GoogleGenAI, Type } from '@google/genai';
import { Book, Review, Video } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractBookDetails(base64Image: string): Promise<Partial<Book>> {
  // Extract the base64 data part from the data URL
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: 'Identify the book in this image. Once identified, act as a world-class book summarizer (like Blinkist or James Clear). Provide a comprehensive profile AND a structured, high-impact summary. Include: title, author, genre, a 1-sentence summary, a detailed description, publication year, page count, publisher, and themes. THEN, provide the world-class summary components: a punchy 3-sentence summary, who the target audience is, 3-5 key takeaways (with a short title and description for each), one piece of highly actionable advice derived from the book, and one notable/famous quote from the book. If the image does NOT contain a book, return an empty object.',
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'The title of the book. Null if not found.',
          },
          author: {
            type: Type.STRING,
            description: 'The author of the book. Null if not found.',
          },
          genre: {
            type: Type.STRING,
            description: 'The primary genre of the book.',
          },
          summary: {
            type: Type.STRING,
            description: 'A very short 1-sentence summary of the book.',
          },
          description: {
            type: Type.STRING,
            description: 'A detailed description or synopsis of the book.',
          },
          publishedYear: {
            type: Type.INTEGER,
            description: 'The original year the book was published.',
          },
          pageCount: {
            type: Type.INTEGER,
            description: 'The estimated or typical page count of the book.',
          },
          publisher: {
            type: Type.STRING,
            description: 'The original or most well-known publisher of the book.',
          },
          themes: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: 'A list of 3-5 key themes explored in the book.',
          },
          threeSentenceSummary: {
            type: Type.STRING,
            description: 'A punchy, high-impact summary of the book in exactly 3 sentences.',
          },
          targetAudience: {
            type: Type.STRING,
            description: 'Who should read this book? (e.g., "Entrepreneurs looking to scale", "Anyone struggling with procrastination").',
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'A short, catchy title for the takeaway.' },
                description: { type: Type.STRING, description: 'A 1-2 sentence explanation of the takeaway.' }
              },
              required: ['title', 'description']
            },
            description: '3-5 core lessons or key takeaways from the book.',
          },
          actionableAdvice: {
            type: Type.STRING,
            description: 'One specific, highly actionable piece of advice the reader can apply immediately based on the book.',
          },
          notableQuote: {
            type: Type.STRING,
            description: 'One famous, impactful, or representative quote from the book.',
          }
        },
        required: ['title', 'author'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from Gemini');
  }

  try {
    const data = JSON.parse(text);
    if (!data.title && !data.author) {
      throw new Error('Could not identify a book in the image.');
    }
    return {
      title: data.title || 'Unknown Title',
      author: data.author || 'Unknown Author',
      genre: data.genre,
      summary: data.summary,
      description: data.description,
      publishedYear: data.publishedYear,
      pageCount: data.pageCount,
      publisher: data.publisher,
      themes: data.themes,
      threeSentenceSummary: data.threeSentenceSummary,
      targetAudience: data.targetAudience,
      keyTakeaways: data.keyTakeaways,
      actionableAdvice: data.actionableAdvice,
      notableQuote: data.notableQuote,
    };
  } catch (e) {
    console.error('Failed to parse Gemini response', e);
    throw new Error('Failed to extract book details.');
  }
}

export async function generateComprehensiveGuide(title: string, author: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview', // Use pro model for deep analysis
    contents: `Act as an expert literary analyst and world-class book summarizer. Write an extremely detailed, comprehensive guide and summary for the book "${title}" by ${author}. 
    
Make it as long and detailed as possible (multiple pages worth of content). 

Include the following sections formatted beautifully in Markdown:
1. **Introduction & Context**: Background on the book, the author, and its historical/cultural significance.
2. **Comprehensive Chapter-by-Chapter (or Part-by-Part) Summary**: A deep dive into the plot, arguments, or narrative arc. Do not skip over details.
3. **Deep Character Analysis (if fiction) or Core Concepts (if non-fiction)**: Detailed breakdown of the main players or ideas.
4. **Thematic Exploration**: An in-depth look at the major themes, motifs, and symbols.
5. **Critical Reception & Legacy**: How the book was received and its lasting impact.
6. **Final Thoughts**: A concluding synthesis.

Use Markdown formatting extensively (headers, bolding, bullet points, blockquotes) to make it highly readable.`,
  });

  if (!response.text) {
    throw new Error('Failed to generate comprehensive guide.');
  }

  return response.text;
}

export async function fetchReviewsAndVideos(title: string, author: string): Promise<{ reviews: Review[], videos: Video[] }> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Find real reader reviews, press critiques, and popular YouTube videos about the book "${title}" by ${author}. 
    Return a JSON object with two arrays:
    1. 'reviews': A mix of 3-5 real press/critique reviews and real reader reviews. Include the URL to the original review if possible.
    2. 'videos': 5-8 real YouTube videos (reviews, summaries, interviews) about this book, including the actual YouTube URL.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reviews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                author: { type: Type.STRING },
                source: { type: Type.STRING, description: 'e.g., The New York Times, Goodreads user, etc.' },
                text: { type: Type.STRING, description: 'A substantial excerpt from the review.' },
                type: { type: Type.STRING, description: 'Either "reader" or "press"' },
                rating: { type: Type.NUMBER, description: 'Rating out of 5, if applicable.' },
                url: { type: Type.STRING, description: 'URL to the original review or source page, if available' }
              },
              required: ['author', 'source', 'text', 'type']
            }
          },
          videos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                channel: { type: Type.STRING },
                url: { type: Type.STRING, description: 'A valid YouTube watch URL, e.g., https://www.youtube.com/watch?v=...' }
              },
              required: ['title', 'channel', 'url']
            }
          }
        },
        required: ['reviews', 'videos']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to fetch reviews and videos.');
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse reviews and videos', e);
    throw new Error('Failed to parse reviews and videos.');
  }
}
