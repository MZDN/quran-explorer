import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #1F3A5F;
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 20px;
`;

const SurahGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const SurahCard = styled(motion.div)`
  background-color: #f0f4f8;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
`;

const SurahName = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #1F3A5F;
`;

const SurahInfo = styled.p`
  margin: 5px 0 0;
  font-size: 14px;
  color: #4A5568;
`;

const SurahView = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const BackButton = styled.button`
  background-color: #1F3A5F;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
`;

const VerseContainer = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  border-left: 3px solid #1F3A5F;
  display: flex;
  flex-direction: column;
`;

const ArabicText = styled.p`
  font-family: 'Amiri', serif;
  font-size: 24px;
  direction: rtl;
  margin-bottom: 10px;
  text-align: right;
`;

const TranslationText = styled.p`
  font-size: 16px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  background-color: #1F3A5F;
  color: white;
  border: none;
  padding: 5px 10px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #A0AEC0;
    cursor: not-allowed;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 18px;
  color: #1F3A5F;
`;

const LanguageSelector = styled.div`
  margin-bottom: 20px;
`;

const LanguageButton = styled.button`
  background-color: ${props => props.active ? '#1F3A5F' : '#f0f4f8'};
  color: ${props => props.active ? 'white' : '#1F3A5F'};
  border: 1px solid #1F3A5F;
  padding: 5px 10px;
  margin-right: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #1F3A5F;
    color: white;
  }
`;

const QuranExplorer = () => {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahVerses, setSurahVerses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const versesPerPage = 10;

  const translations = {
    ar: null,
    en: 131, // Saheeh International
    fr: 136, // Muhammad Hamidullah
    de: 137, // Abu Rida Muhammad ibn Ahmad ibn Rassoul
  };

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('https://api.quran.com/api/v4/chapters?language=en');
        setSurahs(response.data.chapters);
      } catch (error) {
        console.error('Error fetching surahs:', error);
      }
    };

    fetchSurahs();
  }, []);

  const fetchSurahContent = async (surahId, language, page) => {
    setLoading(true);
    try {
      let endpoint = `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=${language}&words=true&word_fields=text_uthmani&page=${page}&per_page=${versesPerPage}`;
      
      if (language !== 'ar' && translations[language]) {
        endpoint += `&translations=${translations[language]}`;
      }

      const response = await axios.get(endpoint);
      const verses = response.data.verses.map(verse => ({
        id: verse.id,
        arabic: verse.words.map(word => word.text_uthmani).join(' '),
        translation: language !== 'ar' && verse.translations ? verse.translations[0].text : null
      }));
      setSurahVerses(verses);
    } catch (error) {
      console.error('Error fetching surah content:', error);
    }
    setLoading(false);
  };

  const handleSurahClick = (surah) => {
    setSelectedSurah(surah);
    setCurrentPage(1);
    fetchSurahContent(surah.id, selectedLanguage, 1);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    if (selectedSurah) {
      setCurrentPage(1);
      fetchSurahContent(selectedSurah.id, language, 1);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchSurahContent(selectedSurah.id, selectedLanguage, newPage);
  };

  const totalPages = selectedSurah ? Math.ceil(selectedSurah.verses_count / versesPerPage) : 0;

  const isRTL = selectedLanguage === 'ar';

  return (
    <AppContainer>
      <Header>
        <h1>QuranVerse: Quranic Verses Explorer</h1>
      </Header>
      
      <ScrollableContent>
        {!selectedSurah ? (
          <SurahGrid>
            {surahs.map((surah) => (
              <SurahCard
                key={surah.id}
                onClick={() => handleSurahClick(surah)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SurahName>{surah.name_simple}</SurahName>
                <SurahInfo>{surah.name_arabic}</SurahInfo>
                <SurahInfo>Verses: {surah.verses_count}</SurahInfo>
              </SurahCard>
            ))}
          </SurahGrid>
        ) : (
          <SurahView>
            <BackButton onClick={() => setSelectedSurah(null)}>
              ← Back to Surah List
            </BackButton>
            <h2>{selectedSurah.name_simple} ({selectedSurah.name_arabic})</h2>
            <LanguageSelector>
              {Object.keys(translations).map(lang => (
                <LanguageButton 
                  key={lang}
                  active={selectedLanguage === lang} 
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang.toUpperCase()}
                </LanguageButton>
              ))}
            </LanguageSelector>
            {loading ? (
              <LoadingText>Loading Surah content...</LoadingText>
            ) : (
              <>
                {surahVerses.map((verse) => (
                  <VerseContainer key={verse.id}>
                    <ArabicText>{verse.arabic}</ArabicText>
                    {selectedLanguage !== 'ar' && verse.translation && (
                      <TranslationText isRTL={isRTL}>{verse.translation}</TranslationText>
                    )}
                  </VerseContainer>
                ))}
                <Pagination>
                  <PageButton 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </PageButton>
                  <span style={{ margin: '0 10px' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <PageButton 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </PageButton>
                </Pagination>
              </>
            )}
          </SurahView>
        )}
      </ScrollableContent>
    </AppContainer>
  );
};

export default QuranExplorer;