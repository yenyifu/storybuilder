import { render, screen } from '@testing-library/react';
import { PageNumber } from '@/components/Canvas/PageNumber';

describe('PageNumber Component', () => {
  test('should show correct labels for cover page', () => {
    render(<PageNumber isFixedPage={true} fixedPageType="cover" side="left" />);
    expect(screen.getByText('Back Cover')).toBeInTheDocument();
    
    render(<PageNumber isFixedPage={true} fixedPageType="cover" side="right" />);
    expect(screen.getByText('Cover')).toBeInTheDocument();
  });

  test('should show Page 1 only on title page right side', () => {
    const { container: leftContainer } = render(
      <PageNumber isFixedPage={true} fixedPageType="title" side="left" pageNumber={1} />
    );
    expect(leftContainer.textContent).not.toContain('Page');
    
    render(<PageNumber isFixedPage={true} fixedPageType="title" side="right" pageNumber={2} />);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  test('should show page number only on ending page left side', () => {
    render(<PageNumber isFixedPage={true} fixedPageType="ending" side="left" pageNumber={6} />);
    expect(screen.getByText('Page 6')).toBeInTheDocument();
    
    const { container: rightContainer } = render(
      <PageNumber isFixedPage={true} fixedPageType="ending" side="right" pageNumber={7} />
    );
    expect(rightContainer.textContent).not.toContain('Page');
  });

  test('should show correct page numbers for story spreads', () => {
    render(<PageNumber pageNumber={2} side="left" />);
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    
    render(<PageNumber pageNumber={3} side="right" />);
    expect(screen.getByText('Page 3')).toBeInTheDocument();
  });

  test('should not show page numbers when pageNumber is 0', () => {
    const { container } = render(
      <PageNumber isFixedPage={true} fixedPageType="title" side="right" pageNumber={0} />
    );
    expect(container.textContent).not.toContain('Page');
  });

  test('should handle undefined side prop gracefully', () => {
    const { container } = render(
      <PageNumber isFixedPage={true} fixedPageType="title" pageNumber={1} />
    );
    // Should not crash, but may not show expected content
    expect(container).toBeInTheDocument();
  });
});
