<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240416135658 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE recipes_cuisine (recipes_id INT NOT NULL, cuisine_id INT NOT NULL, PRIMARY KEY(recipes_id, cuisine_id))');
        $this->addSql('CREATE INDEX IDX_76C8193FFDF2B1FA ON recipes_cuisine (recipes_id)');
        $this->addSql('CREATE INDEX IDX_76C8193FED4BAC14 ON recipes_cuisine (cuisine_id)');
        $this->addSql('ALTER TABLE recipes_cuisine ADD CONSTRAINT FK_76C8193FFDF2B1FA FOREIGN KEY (recipes_id) REFERENCES recipes (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE recipes_cuisine ADD CONSTRAINT FK_76C8193FED4BAC14 FOREIGN KEY (cuisine_id) REFERENCES cuisine (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE recipes_cuisine DROP CONSTRAINT FK_76C8193FFDF2B1FA');
        $this->addSql('ALTER TABLE recipes_cuisine DROP CONSTRAINT FK_76C8193FED4BAC14');
        $this->addSql('DROP TABLE recipes_cuisine');
    }
}
