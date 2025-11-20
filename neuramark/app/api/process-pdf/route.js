import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf');

        if (!file || !file.type.includes('pdf')) {
            return NextResponse.json({ error: 'Invalid PDF file' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text from PDF
        const pdfData = await pdfParse(buffer);
        const pdfText = pdfData.text;

        if (!pdfText || pdfText.trim().length < 100) {
            return NextResponse.json({
                error: 'PDF text extraction failed or PDF contains insufficient text'
            }, { status: 400 });
        }

        // Use Gemini to analyze the syllabus
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response to extract JSON
        let jsonResponse;
        try {
            // Remove markdown code blocks if present
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            jsonResponse = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({
                error: 'Failed to parse AI response. Please try with a clearer PDF.'
            }, { status: 500 });
        }

        const { branch, year, semester, subjects } = jsonResponse;

        if (!branch || !year || !semester || !subjects || subjects.length === 0) {
            return NextResponse.json({
                error: 'Could not extract sufficient syllabus information from the PDF'
            }, { status: 400 });
        }

        // Update database with extracted subjects
        const updatePromises = subjects.map(async (subject) => {
            try {
                // Check if subject already exists
                const existingQuery = query(
                    collection(db, 'syllabus'),
                    where('branch', '==', branch),
                    where('year', '==', year),
                    where('semester', '==', semester),
                    where('name', '==', subject.name)
                );

                const existingDocs = await getDocs(existingQuery);

                if (!existingDocs.empty) {
                    // Update existing subject
                    const docRef = existingDocs.docs[0].ref;
                    await updateDoc(docRef, {
                        modules: subject.modules || [],
                        code: subject.code || '',
                        updatedAt: new Date()
                    });
                    return { action: 'updated', subject: subject.name };
                } else {
                    // Add new subject
                    await addDoc(collection(db, 'syllabus'), {
                        name: subject.name,
                        code: subject.code || `SUB${Date.now().toString().slice(-3)}`,
                        branch,
                        year: parseInt(year),
                        semester: parseInt(semester),
                        modules: subject.modules || [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    return { action: 'added', subject: subject.name };
                }
            } catch (error) {
                console.error(`Error processing subject ${subject.name}:`, error);
                return { action: 'error', subject: subject.name, error: error.message };
            }
        });

        const results = await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            branch,
            year,
            semester,
            subjects: subjects.map((subject, index) => ({
                ...subject,
                result: results[index]
            })),
            message: `Successfully processed ${subjects.length} subjects for ${branch} Year ${year} Semester ${semester}`
        });

    } catch (error) {
        console.error('PDF processing error:', error);
        return NextResponse.json({
            error: 'Internal server error during PDF processing'
        }, { status: 500 });
    }
}