import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface SubMenuBoxProps {
    title: string;
    url: string;
}

export default function SubMenuBox({ title, url }: SubMenuBoxProps) {
    const [isOver, setIsOver] = useState(false);

    return (
        <Card 
            sx={{ 
                maxWidth: 345, 
                position: 'relative', // Contenedor relativo para elementos absolutos
                overflow: 'hidden'    // Oculta el exceso de contenido
            }}
            onMouseOver={() => setIsOver(true)}
            onMouseOut={() => setIsOver(false)}
        >
            <Link to={url} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardActionArea>
                    {/* Contenedor de imagen con posición relativa */}
                    <div style={{ position: 'relative' }}>
                        <CardMedia
                            component="img"
                            height="180"
                            image="/static/images/sharingan.webp"
                            alt={title}
                        />
                        
                        {/* Overlay con posición absoluta */}
                        {isOver && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semitransparente
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography 
                                    variant="h5" 
                                    component="div"
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        padding: 2
                                    }}
                                >
                                    {title}
                                </Typography>
                            </div>
                        )}
                    </div>
                </CardActionArea>
            </Link>
        </Card>
    );
}