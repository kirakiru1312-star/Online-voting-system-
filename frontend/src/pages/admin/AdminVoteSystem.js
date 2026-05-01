import React from 'react';
import systemImg from '../../assets/admin-system-hero.jpg';

function AdminVoteSystem() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Image Section - Covering 22% of page height */}
      <div style={{ 
        width: '100%', 
        height: '82vh', 
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <img 
          src={systemImg} 
          alt="VoteSystem Overview" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
          height: '50%'
        }}></div>
      </div>

      {/* Description Content */}
      <div className="container" style={{ marginTop: '3rem', maxWidth: '1000px' }}>
        <div className="card" style={{ padding: '3rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          
          {/* Amharic Section */}
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dcfce7', borderRadius: '50%', color: '#166534' }}>
                📜
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>ሥርዓተ ድምፅ (VoteSystem) - አጠቃላይ መግለጫ</h2>
            </div>
            <p style={{ 
              fontSize: '1.15rem', 
              lineHeight: '1.8', 
              color: '#334155', 
              textAlign: 'justify',
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              borderLeft: '4px solid #22c55e'
            }}>
              ይህ የአስተዳደር ፖርታል ብሔራዊ የኦንላይን ድምፅ አሰጣጥ ሥርዓትን ለመቆጣጠር የሚያስችል ከፍተኛ ጥበቃ ያለው በይነገጽ ነው። የእያንዳንዱን ድምፅ ትክክለኛነት ለማረጋገጥ ሊለወጥ የማይችል የክትትል መዝገብ (tamper-proof audit trail) እና ባለብዙ ደረጃ የተጠቃሚ ማረጋገጫ (multi-layer authentication) ያካትታል። አስተዳዳሪዎች የቀጥታ የድምፅ አሰጣጥ ሂደቱን በየክልሉ መከታተል፣ የተመዘገቡ የፖለቲካ ፓርቲዎችንና የግል ተወዳዳሪዎችን ማስተዳደር፣ እንዲሁም የደህንነት መዝገቦችን መገምገም ይችላሉ። ሥርዓቱ ያልተፈቀደ የመረጃ ለውጥን ለመከላከል እና ግልጽ የዲሞክራሲያዊ ሂደትን ለማረጋገጥ በብሎክቼይን ቴክኖሎጂ (blockchain technology) ላይ የተገነባ ነው።
            </p>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '4rem' }}></div>

          {/* English Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0f2fe', borderRadius: '50%', color: '#0369a1' }}>
                🛡️
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>VoteSystem Infrastructure Overview</h2>
            </div>
            <p style={{ 
              fontSize: '1.15rem', 
              lineHeight: '1.8', 
              color: '#334155', 
              textAlign: 'justify',
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              borderLeft: '4px solid #38bdf8'
            }}>
              This administrative portal provides a high-security interface for managing the national online voting ecosystem. It features a tamper-proof audit trail and multi-layer authentication to ensure the integrity of every vote cast. Administrators can monitor real-time voter turnout by region, manage verified political parties and independent candidates, and review automated security incident logs. The system is built on blockchain technology to prevent unauthorized data modification and ensure a transparent, democratic process.
            </p>
          </div>

        </div>
      </div>

      <div style={{ height: '5rem' }}></div>
    </div>
  );
}

export default AdminVoteSystem;
