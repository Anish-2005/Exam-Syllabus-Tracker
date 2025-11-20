import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(request) {
    try {
        console.log('PDF processing request received');

        // Check if API key is configured
        if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your_google_ai_api_key_here') {
            console.error('Google AI API key not configured');
            return NextResponse.json({
                error: 'Google AI API key not configured. Please set GOOGLE_AI_API_KEY in your environment variables.'
            }, { status: 500 });
        }

        console.log('API key found, processing form data...');
        const formData = await request.formData();
        const file = formData.get('pdf');

        if (!file || !file.type.includes('pdf')) {
            console.error('Invalid file type:', file?.type);
            return NextResponse.json({ error: 'Invalid PDF file' }, { status: 400 });
        }

        console.log('File received, converting to buffer...');
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log('Extracting text from PDF...');
        // Temporarily mock PDF parsing to test AI functionality
        // TODO: Replace with proper PDF parsing library compatible with Next.js
        const pdfText = `
Computer Science Engineering Syllabus

Year 1 Semester 1:
- Mathematics I
- Physics
- Programming Fundamentals
- English Communication

Year 1 Semester 2:
- Mathematics II
- Chemistry
- Data Structures
- Discrete Mathematics

Year 2 Semester 3:
- Algorithms
- Computer Networks
- Database Management Systems
- Operating Systems

Year 2 Semester 4:
- Software Engineering
- Web Technologies
- Computer Graphics
- Theory of Computation
`;

        console.log('Mock PDF text extracted, length:', pdfText.length);

        console.log('PDF text length:', pdfText?.length);
        if (!pdfText || pdfText.trim().length < 100) {
            return NextResponse.json({
                error: 'PDF text extraction failed or PDF contains insufficient text'
            }, { status: 400 });
        }

        // Use Gemini to analyze the syllabus
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
You are an AI assistant specialized in analyzing academic syllabus documents. Please analyze the following PDF text and extract structured information about the syllabus.

Extract the following information in JSON format:
1. branch: The academic branch/department (e.g., "Computer Science", "Mechanical Engineering")
2. year: The academic year (1, 2, 3, or 4)
3. semester: The semester number (1-8, where year 1 has semesters 1-2, year 2 has 3-4, etc.)
4. subjects: Array of subject objects, each containing:
   - name: Subject name
   - code: Subject code (if available)
   - modules: Array of module objects with:
     - name: Module name
     - topics: Array of topic strings

IMPORTANT: 
- If you cannot determine exact values, use reasonable defaults or null
- For subjects without codes, you can generate codes like "SUB001", "SUB002", etc.
- Focus on extracting actual syllabus content, not administrative information
- Return ONLY valid JSON, no additional text

PDF Text:
${pdfText.substring(0, 15000)} // Limit text length for API
`;

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (aiError) {
            console.error('Gemini AI error:', aiError);
            if (aiError.message.includes('API_KEY')) {
                return NextResponse.json({
                    error: 'Invalid Google AI API key. Please check your GOOGLE_AI_API_KEY configuration.'
                }, { status: 500 });
            }
            return NextResponse.json({
                error: 'AI processing failed. Please try again or contact support.'
            }, { status: 500 });
        }

        const response = await result.response;
        const text = response.text();
        console.log('Raw AI response:', text);

        // Clean the response to extract JSON
        let jsonResponse;
        try {
            // Remove markdown code blocks if present
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            console.log('Cleaned AI response:', cleanedText);
            jsonResponse = JSON.parse(cleanedText);
            console.log('Parsed JSON response:', jsonResponse);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({
                error: 'Failed to parse AI response. Please try with a clearer PDF.',
                rawResponse: text
            }, { status: 500 });
        }

        const { branch, year, semester, subjects } = jsonResponse;
        const { branch, year, semester, subjects } = jsonResponse;
        console.log('Extracted data:', { branch, year, semester, subjectsCount: subjects?.length });

        // Temporarily relax validation to see what we're getting
        if (!subjects || subjects.length === 0) {
            return NextResponse.json({
                error: 'Could not extract sufficient syllabus information from the PDF',
                extractedData: { branch, year, semester, subjects },
                rawResponse: text
            }, { status: 400 });
        }

        // For now, skip database operations and just return the AI response
        console.log('Skipping database operations for testing');
        return NextResponse.json({
            success: true,
            branch: branch || 'Computer Science',
            year: year || 1,
            semester: semester || 1,
            subjects: subjects || [],
            message: `Successfully processed ${subjects?.length || 0} subjects for ${branch || 'Unknown Branch'} Year ${year || 'N/A'} Semester ${semester || 'N/A'} (database operations skipped)`
        });

    } catch (error) {
        console.error('PDF processing error:', error);
        return NextResponse.json({
            error: 'Internal server error during PDF processing'
        }, { status: 500 });
    }
}